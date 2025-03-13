const fs = require("fs"); // Módulo para manejar archivos
const path = require("path");
const RevisionThesis = require("../models/revisionThesis");
const Sede = require("../models/sede");
const User = require("../models/user");
const ApprovalThesis = require("../models/approvalThesis");
const { Op } = require("sequelize");
const AssignedReview = require("../models/assignedReviewthesis");
const Year = require("../models/year");
const CommentsRevision = require("../models/commentsRevisionThesis");
const { sendEmailThesisRequest } = require("../services/emailService");
const moment = require("moment");
/**
 * The function `uploadRevisionThesis` handles the upload of a thesis revision, verifying the
 * existence of required files, validating user information, and ensuring that no active revision
 * process exists before creating a new one.
 * @param req - The `req` parameter represents the HTTP request object, which contains the thesis
 * and approval letter files, as well as user details such as `carnet` and `sede_id`.
 * @param res - The `res` parameter represents the HTTP response object used to send back the result
 * of the operation.
 * @returns A JSON response indicating success or failure, including validation errors if the user
 * does not exist, is not a student, the sede does not exist, or the user already has an active
 * revision process.
 */
const uploadRevisionThesis = async (req, res) => {
  let approval_letter_dir = null;
  let thesis_dir = null;
  try {
    const { carnet, sede_id } = req.body;

    // Verificar si ambos archivos fueron subidos
    if (!req.files || !req.files["approval_letter"] || !req.files["thesis"]) {
      throw new Error(
        "Se requieren ambos archivos (carta de aprobación y tesis)"
      );
    }
    if (carnet) {
      const carnetRegex = /^\d{4}-\d{2}-\d{4,}$/;
      if (!carnetRegex.test(carnet)) {
        throw new Error("Carnet inválido, ingrese carnet completo" + carnet);
      }
    }

    // Desestructurar los archivos subidos
    const { approval_letter, thesis } = req.files;

    // Obtener las rutas de los archivos subidos
    approval_letter_dir = `/uploads/revisionthesis/${approval_letter[0].filename}`;
    thesis_dir = `/uploads/revisionthesis/${thesis[0].filename}`;

    // Validar que el usuario exista
    const userInfo = await User.findOne({
      where: { carnet },
    });
    if (!userInfo) {
      throw new Error("Usuario no encontrado");
    }
    const user_id = userInfo.user_id;

    // Validar que el usuario sea un estudiante (rol_id === 1)
    if (userInfo.rol_id !== 1) {
      throw new Error("Error, debe de ser estudiante");
    }

    // Validar que la sede exista
    const sedeInfo = await Sede.findByPk(sede_id);
    if (!sedeInfo) {
      throw new Error("Sede no encontrada");
    }

    // Verificar si el usuario ya tiene una revisión activa
    const userRevisions = await RevisionThesis.findAll({
      where: { user_id },
    });

    if (userRevisions.length > 0) {
      // Buscar si alguna revisión tiene un proceso activo
      const activeRevision = userRevisions.find((rev) => rev.active_process);

      if (activeRevision) {
        throw new Error(
          `El estudiante ya cuenta con un proceso de revisión activo en la sede ${sedeInfo.nameSede}`
        );
      }

      // Verificar si alguna revisión anterior ya fue aprobada
      const approvedRevision = await ApprovalThesis.findOne({
        where: {
          revision_thesis_id: userRevisions.map(
            (rev) => rev.revision_thesis_id
          ), // Buscar en todas las revisiones del usuario
          status: "approved",
        },
      });

      if (approvedRevision) {
        throw new Error(
          `El estudiante no puede mandar solicitud porque ya se aprobó su tesis`
        );
      }
    }

    // Crear la nueva revisión de tesis
    const newRevision = await RevisionThesis.create({
      user_id,
      sede_id,
      approval_letter_dir,
      thesis_dir,
    });

    await ApprovalThesis.create({
      revision_thesis_id: newRevision.revision_thesis_id,
      user_id: user_id,
      status: "pending",
      date_aproved: null,
    });

    // Obtener informacion del coordinador de tesis
    const CordinadorThesis = await User.findOne({
      where: { rol_id: 6 },
    });

    // Enviar correo electrónico al coordinador de sede
    const templateVariables = {
      recipient_name: CordinadorThesis.name,
      student_name: userInfo.name,
      campus_name: sedeInfo.nameSede,
      request_date: moment(newRevision.date_revision).format(
        "DD/MM/YYYY HH:mm"
      ),
    };

    await sendEmailThesisRequest(
      "Solicitud de revisión de tesis",
      CordinadorThesis.email,
      templateVariables
    );

    // Respuesta exitosa
    res.status(201).json({
      message: "Revisión de tesis creada con éxito",
    });
  } catch (error) {
    console.error("Error en la subida de archivos:", error);

    // Eliminar los archivos subidos si ocurre un error
    if (approval_letter_dir) {
      fs.unlinkSync(path.join(__dirname, `../public${approval_letter_dir}`));
    }
    if (thesis_dir) {
      fs.unlinkSync(path.join(__dirname, `../public${thesis_dir}`));
    }

    // Respuesta de error
    if (error.message.includes("proceso de revisión activo")) {
      return res.status(409).json({
        title: "No es posible crear una nueva revisión de tesis",
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Error al subir la revisión de tesis",
      error: error.message,
    });
  }
};

/**
 * The function `getRevisionsByUserId` retrieves all active thesis revisions for a given student,
 * including user details, assigned reviewers, and the formatted thesis file path.
 * @param req - The HTTP request object, containing the `user_id` as a URL parameter.
 * @param res - The HTTP response object used to return the result of the request.
 * @returns A JSON response with the list of active thesis revisions for the user, or an error message
 * if none are found or if an internal server error occurs.
 */
const getRevisionsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Obtener todas las revisiones del estudiante con active_process: true
    const revisions = await RevisionThesis.findAll({
      where: {
        user_id,
        active_process: true,
      },
      attributes: [
        "revision_thesis_id",
        "thesis_dir",
        "date_revision",
        "active_process",
      ],
      include: [
        {
          model: User,
          attributes: ["name", "carnet", "email", "profilePhoto"],
          include: [
            {
              model: Sede,
              as: "location",
              attributes: ["nameSede"],
            },
            {
              model: Year,
              as: "year",
              attributes: ["year"],
            },
          ],
        },
        {
          model: AssignedReview,
          attributes: ["assigned_review_id"],
          required: false, // No es obligatorio que haya asignaciones
          include: [
            {
              model: User,
              attributes: ["name", "email"], // Información del revisor asignado
            },
          ],
        },
      ],
    });

    // Si no hay revisiones para el estudiante
    if (revisions.length === 0) {
      return res.status(404).json({
        message: "No se encontraron revisiones para el estudiante",
      });
    }

    // Mapear los datos para agregar el baseURL a thesis_dir
    const mappedRevisions = revisions.map((revision) => ({
      ...revision.toJSON(), // Convertir a objeto plano
      thesis_dir: `${
        process.env.BASE_URL + "/public" || "http://localhost:3000/public"
      }${revision.thesis_dir}`,
      assigned_reviewer: revision.AssignedReviews.length
        ? revision.AssignedReviews.map((assignedReview) => ({
            reviewer_name: assignedReview.User.name,
            reviewer_email: assignedReview.User.email,
          }))
        : null, // Si no hay revisor asignado, asignamos null
    }));

    // Respuesta exitosa
    res.status(200).json({
      message: "Revisiones del estudiante obtenidas con éxito",
      data: mappedRevisions,
    });
  } catch (error) {
    console.error("Error al obtener las revisiones del estudiante:", error);
    res.status(500).json({
      message: "Error al obtener las revisiones del estudiante",
      error: error.message,
    });
  }
};

/**
 * The function `getPendingRevisions` retrieves all pending thesis revisions that have not been assigned
 * to a reviewer, with optional filtering by student ID (`carnet`) and ordering by date.
 * @param req - The HTTP request object, allowing query parameters `order` (asc/desc) and `carnet`.
 * @param res - The HTTP response object used to return the list of pending thesis revisions.
 * @returns A JSON response with the list of pending thesis revisions or an error message if none are found
 * or if an internal server error occurs.
 */
const getPendingRevisions = async (req, res) => {
  try {
    const { order = "asc", carnet } = req.query;
    const orderDirection = order.toLowerCase() === "desc" ? "DESC" : "ASC";

    const whereClause = {
      active_process: true,
      "$AssignedReviews.assigned_review_id$": null, 
    };

    if (carnet) {
      if (!/^\d{4}-\d{2}-\d{2,}$/.test(carnet)) {
        return res.status(400).json({ message: "Carnet inválido" });
      }
      whereClause["$User.carnet$"] = { [Op.like]: `%${carnet}%` };
    }

    const pendingRevisions = await RevisionThesis.findAll({
      attributes: ["revision_thesis_id", "date_revision"],
      where: whereClause,
      include: [
        {
          model: ApprovalThesis,
          where: { status: "pending" },
          attributes: ["status"],
        },
        {
          model: User,
          attributes: ["user_id", "name", "carnet"],
        },
        {
          model: AssignedReview,
          attributes: [],
          required: false,
        },
      ],
      order: [["date_revision", orderDirection]],
      limmit: 100,
    });

    return res.status(pendingRevisions.length ? 200 : 404).json({
      message:
        pendingRevisions.length > 0
          ? "Revisiones de tesis pendientes sin asignar obtenidas con éxito"
          : "No hay revisiones de tesis pendientes sin asignar",
      orden: orderDirection,
      data: pendingRevisions.map((revision) => ({
        ...revision.toJSON(),
        ApprovalThesis: { ...revision.ApprovalThesis, status: "pendiente" },
      })),
    });
  } catch (error) {
    console.error("Error al obtener las revisiones pendientes:", error);
    return res.status(500).json({
      message: "Error al obtener las revisiones pendientes",
      error: error.message,
    });
  }
};

/**
 * The function `getRevisionsInReview` retrieves all thesis revisions that are currently in review
 * and have been assigned to a reviewer, with optional filtering by student ID (`carnet`) and ordering by date.
 * @param req - The HTTP request object, allowing query parameters `order` (asc/desc) and `carnet`.
 * @param res - The HTTP response object used to return the list of thesis revisions in review.
 * @returns A JSON response with the list of thesis revisions in review or an error message if none are found
 * or if an internal server error occurs.
 * @returns A JSON response with the list of thesis revisions in review or an error message if none are found
 * or if an internal server error occurs.
 * @returns A JSON response with the list of thesis revisions in review or an error message if none are found
 * or if an internal server error occurs.
 *  */
const getRevisionsInReview = async (req, res) => {
  try {
    const { order = "asc", carnet } = req.query;

    const orderDirection = order === "desc" ? "DESC" : "ASC";

    const userWhereClause = {};
    if (carnet) {
      const carnetRegex = /^\d{4}-\d{2}-\d{2,}$/;
      if (!carnetRegex.test(carnet)) {
        return res.status(400).json({ message: "Carnet inválido" });
      }

      const carnetParts = carnet.split("-");
      if (carnetParts[2].length < 2) {
        return res
          .status(400)
          .json({ message: "Debe ingresar al menos 2 dígitos del carnet" });
      }

      userWhereClause.carnet = { [Op.like]: `%${carnet}%` };
    }

    const revisionsInReview = await RevisionThesis.findAll({
      attributes: ["revision_thesis_id", "date_revision"],
      where: { active_process: true },
      include: [
        {
          model: ApprovalThesis,
          where: { status: "in revision" },
          attributes: ["status"],
        },
        {
          model: User,
          attributes: ["user_id", "name", "carnet"],
          where: userWhereClause,
        },
        {
          model: AssignedReview,
          attributes: ["assigned_review_id", "user_id"],
          required: true,
        },
      ],
      order: [["date_revision", orderDirection]],
    });

    if (revisionsInReview.length === 0) {
      return res.status(404).json({
        message: "No hay revisiones en revisión con revisor asignado",
      });
    }

    // Convertir el estado "in revision" a "en revisión"
    const formattedRevisions = revisionsInReview.map((revision) => ({
      ...revision.toJSON(),
      ApprovalThesis: {
        ...revision.ApprovalThesis,
        status: "en revisión",
      },
    }));

    res.status(200).json({
      message:
        "Revisiones en revisión con revisor asignado obtenidas con éxito",
      orden: orderDirection,
      data: formattedRevisions,
    });
  } catch (error) {
    console.error("Error al obtener las revisiones en revisión:", error);
    res.status(500).json({
      message: "Error al obtener las revisiones en revisión",
      error: error.message,
    });
  }
};

/**
 * The function `getRevisionsInReview` retrieves all thesis revisions that are currently in review
 * and have been assigned to a reviewer, with optional filtering by student ID (`carnet`) and ordering by date.
 * @param req - The HTTP request object, allowing query parameters `order` (asc/desc) and `carnet`.
 * @param res - The HTTP response object used to return the list of thesis revisions in review.
 * @returns A JSON response with the list of thesis revisions in review or an error message if none are found
 * or if an internal server error occurs.
 */
const getInforRevisionsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Obtener todas las revisiones solicitadas por el usuario
    const revisions = await RevisionThesis.findAll({
      where: { user_id },
      attributes: ["revision_thesis_id", "active_process", "thesis_dir"], // Estado de la revisión
      include: [
        {
          model: AssignedReview,
          attributes: ["assigned_review_id", "date_assigned"], // Información de la asignación
          required: false, // No es obligatorio que haya asignaciones
          include: [
            {
              model: User,
              attributes: ["user_id", "name", "email"], // Información del revisor asignado
            },
            {
              model: CommentsRevision,
              attributes: ["title", "comment", "date_comment"], // Comentarios del revisor asignado
            },
          ],
        },
        {
          model: User,
          attributes: ["name", "carnet", "email", "profilePhoto"],
          include: [
            {
              model: Sede,
              as: "location",
              attributes: ["nameSede"],
            },
            {
              model: Year,
              as: "year",
              attributes: ["year"],
            },
          ],
        },
        {
          model: ApprovalThesis,
          attributes: ["status", "date_approved", "approved"], // Datos de aprobación
          required: false,
        },
      ],
    });

    // Si no hay revisiones para el usuario
    if (revisions.length === 0) {
      return res.status(404).json({
        message: "No se encontraron revisiones para el usuario",
      });
    }

    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    
    // Modificar thesis_dir para concatenar la BASE_URL
    const updatedRevisions = revisions.map(revision => {
      // Convertir la revisión a JSON para evitar la estructura circular
      const revisionData = revision.toJSON();

      const userWithUpdatedPhoto = revisionData.User.profilePhoto 
        ? { ...revisionData.User, profilePhoto: `${BASE_URL}/public${revisionData.User.profilePhoto}` }
        : revisionData.User;
        
      return {
        ...revisionData,
        thesis_dir: `${BASE_URL}/public${revisionData.thesis_dir}`,
        User: userWithUpdatedPhoto, // Actualizamos el perfil del usuario con la URL completa de la foto
      };
    });

    // Responder con éxito
    res.status(200).json({
      message: "Revisiones obtenidas con éxito",
      data: updatedRevisions,
    });
  } catch (error) {
    console.error("Error al obtener la información de revisiones:", error);
    res.status(500).json({
      message: "Error al obtener la información de revisiones",
      error: error.message,
    });
  }
};



/**
 * The function `getApprovedRevisions` retrieves all thesis revisions that have been approved,
 * with optional filtering by student ID (`carnet`) and ordering by date.
 * @param req - The HTTP request object, allowing query parameters `order` (asc/desc) and `carnet`.
 * @param res - The HTTP response object used to return the list of approved thesis revisions.
 * @returns A JSON response with the list of approved thesis revisions or an error message if none are found
 * or if an internal server error occurs.
 */
const getApprovedRevisions = async (req, res) => {
  try {
    const { order = "asc", carnet } = req.query;

    const orderDirection = order === "desc" ? "DESC" : "ASC";

    const userWhereClause = {};
    if (carnet) {
      // Validar el formato del carnet
      const carnetRegex = /^\d{4}-\d{2}-\d{2,}$/;
      if (!carnetRegex.test(carnet)) {
        return res.status(400).json({ message: "Carnet inválido" });
      }

      // Validar que se ingresen al menos 2 dígitos del carnet
      const carnetParts = carnet.split("-");
      if (carnetParts[2].length < 2) {
        return res
          .status(400)
          .json({ message: "Debe ingresar al menos 2 dígitos del carnet" });
      }

      // Agregar el carnet al filtro de búsqueda
      userWhereClause.carnet = { [Op.like]: `%${carnet}%` };
    }

    // Obtener revisiones aprobadas
    const approvedRevisions = await RevisionThesis.findAll({
      attributes: ["revision_thesis_id", "date_revision", "thesis_dir"],
      include: [
        {
          model: ApprovalThesis,
          where: { status: "approved" }, // Solo revisiones aprobadas
          attributes: ["status", "date_approved"],
        },
        {
          model: User,
          attributes: ["user_id", "name", "carnet"],
          where: userWhereClause,
        },
        {
          model: Sede,
          attributes: ["nameSede"], // Incluir información de la sede
        },
      ],
      order: [["date_revision", orderDirection]], // Ordenar por fecha de revisión
    });

    // Si no hay revisiones aprobadas
    if (approvedRevisions.length === 0) {
      return res.status(404).json({
        message: "No hay revisiones de tesis aprobadas",
      });
    }

    // Formatear las revisiones aprobadas
    const formattedRevisions = approvedRevisions.map((revision) => {
      const revisionData = revision.toJSON();
      return {
        ...revisionData,
        thesis_dir: `${
          process.env.BASE_URL + "/public" || "http://localhost:3000/public"
        }${revisionData.thesis_dir}`, // Agregar baseURL a la ruta del archivo
        ApprovalThesis: revisionData.ApprovalThesis
          ? {
              ...revisionData.ApprovalThesis,
              status: "aprobada", // Traducir el estado a español
            }
          : null, // Si no hay ApprovalThesis, asignar null
      };
    });

    // Respuesta exitosa
    res.status(200).json({
      message: "Revisiones de tesis aprobadas obtenidas con éxito",
      orden: orderDirection,
      data: formattedRevisions,
    });
  } catch (error) {
    console.error("Error al obtener las revisiones aprobadas:", error);
    res.status(500).json({
      message: "Error al obtener las revisiones aprobadas",
      error: error.message,
    });
  }
};

module.exports = {
  uploadRevisionThesis,
  getPendingRevisions,
  getRevisionsByUserId,
  getRevisionsInReview,
  getInforRevisionsByUserId,
  getApprovedRevisions,
};
