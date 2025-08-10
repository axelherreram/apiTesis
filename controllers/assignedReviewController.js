const ApprovalThesis = require("../models/approvalThesis");
const AssignedReview = require("../models/assignedReviewthesis");
const RevisionThesis = require("../models/revisionThesis");
const User = require("../models/user");
const { sendEmailReviewerAsigned } = require("../services/emailService");
const moment = require("moment-timezone");
const { Op } = require("sequelize");

/**
 * The function `createAssignedReview` assigns a reviewer to a thesis revision, ensuring the user
 * exists, has the correct role, and that the revision is active and not already assigned.
 * @param req - The `req` parameter represents the HTTP request object containing the `revision_thesis_id`
 * and `user_id` in the request body.
 * @param res - The `res` parameter represents the HTTP response object used to send back the result
 * of the operation.
 * @returns A JSON response indicating success or failure, including messages if the user does not exist,
 * is not a reviewer or coordinator, if the thesis revision does not exist or is inactive, or if an
 * assignment already exists.
 */
const createAssignedReview = async (req, res) => {
  try {
    const { revision_thesis_id, user_id } = req.body;

    // Consultar usuario y revisión en paralelo
    const [infoUser, infoRevision] = await Promise.all([
      User.findByPk(user_id),
      RevisionThesis.findByPk(revision_thesis_id),
    ]);

    // Validaciones
    if (!infoUser) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No existe un usuario con ID ${user_id}.`,
      });
    }

    if (![6, 7].includes(infoUser.rol_id)) {
      return res.status(400).json({
        message: "El usuario no es un revisor o coordinador",
      });
    }

    if (!infoRevision) {
      return res.status(404).json({
        message: "Revisión de tesis no encontrada",
        details: `No existe una revisión con ID ${revision_thesis_id}.`,
      });
    }

    if (!infoRevision.active_process) {
      return res.status(400).json({
        message: "La revisión no está activa",
      });
    }

    // Verificar si ya tiene un revisor asignado
    const existingAssignment = await AssignedReview.findOne({
      where: { revision_thesis_id },
    });

    if (existingAssignment) {
      return res.status(409).json({
        message: "La revisión ya tiene un revisor asignado",
      });
    }

    // Crear asignación y actualizar estado en paralelo
    await Promise.all([
      AssignedReview.create({ revision_thesis_id, user_id }),
      ApprovalThesis.update(
        { status: "in revision" },
        { where: { revision_thesis_id } }
      ),
    ]);

    // Enviar correo al revisor
    await sendEmailReviewerAsigned("Nueva revisión", infoUser.email, {
      reviewer_name: infoUser.name,
      reviewer_date: moment().tz("America/Guatemala").format("DD/MM/YYYY, h:mm A"),
    });

    return res.status(201).json({ message: "Revisión asignada con éxito" });
  } catch (error) {
    console.error("Error al asignar la revisión:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      details: error.message,
    }); 
  }
};


/**
 * The function `getAssignedReviewsByUser` retrieves the assigned reviews for a specific user, with optional
 * filtering by `carnet` and ordering by `date_assigned`.
 * @param {Object} req - The HTTP request object containing the `user_id` in the request parameters and optional `order` and `carnet` in the query parameters.
 * @param {Object} res - The HTTP response object used to send back the result of the operation.
 * @returns {Promise<void>} A JSON response indicating success or failure, including the list of assigned reviews
 * or a message if no reviews are found.
 */
const getAssignedReviewsByUser = async (req, res) => {
  const { user_id } = req.params;
  const { order = "desc", carnet = "" } = req.query; // Valores por defecto

  try {
    // Validar que el usuario exista
    const infoUser = await User.findByPk(user_id);
    if (!infoUser) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Configurar la ordenación (por defecto DESC)
    const orderDirection = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    // Obtener las revisiones asignadas al usuario con filtros y ordenación
    const assignedReviews = await AssignedReview.findAll({
      where: {
        user_id,
      },
      attributes: ["date_assigned"],
      order: [["date_assigned", orderDirection]], // Ordenación dinámica
      include: [
        {
          model: RevisionThesis,
          attributes: ["revision_thesis_id", "date_revision", "active_process"],
          include: [
            {
              model: ApprovalThesis,
              attributes: ["status"],
              where: { 
                status: {
                  [Op.in]: ["in revision", "rejected"] // Usar Op.in para múltiples valores
                }
              },
            },
            {
              model: User,
              attributes: ["user_id","name", "email", "carnet"],
              where: carnet ? { carnet: { [Op.like]: `%${carnet}%` } } : {}, // Filtro dentro de User
            },
          ],
        },
      ],
    });

    if (assignedReviews.length === 0) {
      return res.status(200).json({
        message: "No tienes revisiones asignadas con estado 'en revisión' o 'rechazado'",
        reviews: [],
      });
    }

    // Agrupar las revisiones por usuario (carnet) y obtener solo la más reciente
    const groupedByUser = {};
    
    assignedReviews.forEach((review) => {
      if (review.RevisionThesis && review.RevisionThesis.User) {
        const userCarnet = review.RevisionThesis.User.carnet;
        const reviewDate = new Date(review.date_assigned);
        
        // Si es la primera revisión de este usuario o si es más reciente
        if (!groupedByUser[userCarnet] || 
            reviewDate > new Date(groupedByUser[userCarnet].date_assigned)) {
          groupedByUser[userCarnet] = review;
        }
      }
    });

    // Convertir el objeto agrupado a array
    const uniqueReviews = Object.values(groupedByUser);

    // Ordenar las revisiones únicas según el parámetro order
    uniqueReviews.sort((a, b) => {
      const dateA = new Date(a.date_assigned);
      const dateB = new Date(b.date_assigned);
      
      if (orderDirection === "ASC") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    // Transformar los estados a español
    const transformedReviews = uniqueReviews.map((review) => {
      if (review.RevisionThesis) {
        review.RevisionThesis.approvaltheses =
          review.RevisionThesis.approvaltheses.map((approval) => {
            if (approval.status === "in revision") {
              approval.status = "En revisión";
            } else if (approval.status === "rejected") {
              approval.status = "Rechazado";
            }
            return approval;
          });
      }
      return review;
    });

    res.status(200).json({
      message: "Revisiones asignadas obtenidas con éxito",
      reviews: transformedReviews,
      totalUsers: uniqueReviews.length,
      totalReviews: assignedReviews.length
    });
  } catch (error) {
    console.error("Error al obtener revisiones asignadas:", error);
    res.status(500).json({
      message: "Error interno del servidor al obtener revisiones asignadas",
      details: `Ocurrió un error inesperado: ${error.message}. Por favor, contacta al administrador del sistema.`,
    });
  }
};



module.exports = {
  createAssignedReview,
  getAssignedReviewsByUser,
};
