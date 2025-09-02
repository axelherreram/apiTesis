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
  const { order = "desc", carnet = "" } = req.query;

  try {
    // Validar que el usuario exista
    const infoUser = await User.findByPk(user_id);
    if (!infoUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const orderDirection = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    // Obtener TODAS las asignaciones del usuario (sin filtrar por estado)
    const assignedReviews = await AssignedReview.findAll({
      where: { user_id },
      attributes: ["date_assigned"],
      include: [
        {
          model: RevisionThesis,
          attributes: ["revision_thesis_id", "date_revision", "active_process"],
          include: [
            {
              model: ApprovalThesis,
              attributes: ["status"],
            },
            {
              model: User,
              attributes: ["user_id", "name", "email", "carnet"],
              where: carnet ? { carnet: { [Op.like]: `%${carnet}%` } } : {},
              required: true,
            },
          ],
          required: true,
        },
      ],
    });

    if (assignedReviews.length === 0) {
      return res.status(200).json({ message: "No tienes revisiones asignadas", reviews: [] });
    }

    // Normaliza estado a español con prioridad: en revisión > Rechazada > Aprobado > Sin estado
    const getNormalizedStatus = (review) => {
      const approvals = review?.RevisionThesis?.approvaltheses || [];
      const hasInRevision = approvals.some(ap => ap.status === "in revision" || ap.status === "en revisión");
      if (hasInRevision) return "en revisión";
      const hasRejected = approvals.some(ap => ap.status === "rejected" || ap.status === "Rechazada");
      if (hasRejected) return "Rechazado";
      const hasApproved = approvals.some(ap => ap.status === "approved" || ap.status === "Aprobado");
      if (hasApproved) return "Aprobado";
      return "Sin estado";
    };

    // Agrupar por estudiante (por nombre normalizado)
    const reviewsByStudentName = assignedReviews.reduce((acc, review) => {
      const name = review?.RevisionThesis?.User?.name || "";
      const key = name.trim().toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(review);
      return acc;
    }, {});

    // Seleccionar 1 por estudiante: prioriza "en revisión", si no hay, la más reciente
    const pickMostRelevant = (arr) => {
      const sortByAssignedDesc = (x, y) => new Date(y.date_assigned) - new Date(x.date_assigned);
      const inRevision = arr.filter(r => getNormalizedStatus(r) === "en revisión").sort(sortByAssignedDesc);
      if (inRevision.length) return inRevision[0];
      return [...arr].sort(sortByAssignedDesc)[0];
    };

    const onePerStudent = Object.values(reviewsByStudentName).map(pickMostRelevant);

    // Traducir estados al español en el payload seleccionado
    const translateApprovals = (review) => {
      if (review?.RevisionThesis?.approvaltheses) {
        review.RevisionThesis.approvaltheses.forEach(ap => {
          if (ap.status === "in revision") ap.status = "en revisión";
          else if (ap.status === "rejected") ap.status = "Rechazado";
          else if (ap.status === "approved") ap.status = "Aprobado";
        });
      }
      return review;
    };

    const translated = onePerStudent.map(translateApprovals);

    // Orden final: en revisión primero; luego por fecha segun 'order'
    const sorted = translated.sort((a, b) => {
      const aIn = getNormalizedStatus(a) === "en revisión";
      const bIn = getNormalizedStatus(b) === "en revisión";
      if (aIn && !bIn) return -1;
      if (!aIn && bIn) return 1;

      const da = new Date(a.date_assigned);
      const db = new Date(b.date_assigned);
      return orderDirection === "ASC" ? da - db : db - da;
    });

    return res.status(200).json({
      message: "Revisiones asignadas obtenidas con éxito",
      reviews: sorted,
    });
  } catch (error) {
    console.error("Error al obtener revisiones asignadas:", error);
    return res.status(500).json({
      message: "Error interno del servidor al obtener revisiones asignadas",
      details: error.message,
    });
  }
};

/**
 * The function `getReviewHistoryByUser` retrieves the review history for a specific user, with optional
 * filtering by `carnet` and ordering by `date_assigned`.
 * @param {Object} req - The HTTP request object containing the `user_id` in the request parameters and optional `order` and `carnet` in the query parameters.
 * @param {Object} res - The HTTP response object used to send back the result of the operation.
 * @returns {Promise<void>} A JSON response indicating success or failure, including the list of review history
 * or a message if no reviews are found.
 */
const getReviewHistoryByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { order = "desc", carnet } = req.query;

    // Validar el formato del orden
    const orderDirection = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    // Construcción dinámica de filtros
    const whereClause = { user_id };
    const userWhereClause = carnet ? { carnet: { [Op.like]: `%${carnet}%` } } : {};

    // Obtener historial de revisiones
    const reviewHistory = await AssignedReview.findAll({
      attributes: ["date_assigned"],
      where: whereClause,
      order: [["date_assigned", orderDirection]],
      include: [
        {
          model: RevisionThesis,
          attributes: ["date_revision", "active_process"],
          include: [
            {
              model: ApprovalThesis,
              attributes: ["status", "date_approved"],
            },
            {
              model: User,
              attributes: ["user_id", "name", "email", "carnet"],
              where: userWhereClause,
            },
          ],
        },
      ],
    });

    return res.status(reviewHistory.length ? 200 : 404).json({
      message: reviewHistory.length
        ? "Historial de revisiones obtenido con éxito"
        : "No hay historial de revisiones para este usuario",
      reviews: reviewHistory,
    });
  } catch (error) {
    console.error("Error al obtener el historial de revisiones:", error);
    return res.status(500).json({
      message: "Error interno del servidor al obtener el historial de revisiones",
      details: error.message,
    });
  }
};


module.exports = {
  createAssignedReview,
  getAssignedReviewsByUser,
  getReviewHistoryByUser,
};
