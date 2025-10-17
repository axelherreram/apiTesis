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
const moment = require("moment-timezone");
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
      request_date: moment(newRevision.date_revision).tz("America/Guatemala").format(
        "DD/MM/YYYY, h:mm A"
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
        ApprovalThesis: { ...revision.ApprovalThesis, status: "Pendiente" },
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
 * Returns only the most recent revision per user when multiple revisions exist.
 * @param req - The HTTP request object, allowing query parameters `order` (asc/desc) and `carnet`.
 * @param res - The HTTP response object used to return the list of thesis revisions in review.
 * @returns A JSON response with the list of thesis revisions in review or an error message if none are found
 * or if an internal server error occurs.
 */
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
      attributes: ["revision_thesis_id", "date_revision", "user_id"],
      include: [
        {
          model: ApprovalThesis,
          where: { status: { [Op.in]: ["in revision", "rejected"] } },
          attributes: ["status"],
          required: true,
        },
        {
          model: User,
          attributes: ["user_id", "name", "carnet"],
          where: userWhereClause,
          required: true,
        },
        {
          model: AssignedReview,
          attributes: ["assigned_review_id", "user_id"],
          required: true,
        },
      ],
      order: [["date_revision", "DESC"]],
    });

    if (revisionsInReview.length === 0) {
      return res.status(404).json({
        message: "No hay revisiones en revisión con revisor asignado",
      });
    }

    // Filtrar para obtener solo la revisión más reciente por usuario
    const userLatestRevisions = new Map();
    
    revisionsInReview.forEach((revision) => {
      const userId = revision.user_id;
      
      if (!userLatestRevisions.has(userId)) {
        userLatestRevisions.set(userId, revision);
      } else {
        const existingRevision = userLatestRevisions.get(userId);
        if (new Date(revision.date_revision) > new Date(existingRevision.date_revision)) {
          userLatestRevisions.set(userId, revision);
        }
      }
    });

    // Convertir el Map a array y aplicar el ordenamiento solicitado
    let uniqueRevisions = Array.from(userLatestRevisions.values());
    
    uniqueRevisions.sort((a, b) => {
      const dateA = new Date(a.date_revision);
      const dateB = new Date(b.date_revision);
      return orderDirection === "ASC" ? dateA - dateB : dateB - dateA;
    });

    // Formatear las revisiones manteniendo el status en inglés
    const formattedRevisions = uniqueRevisions.map((revision) => {
      const revisionData = revision.toJSON();
      
      // Manejar tanto ApprovalThesis como approvaltheses
      let approvalStatus = null;
      if (revisionData.ApprovalThesis) {
        approvalStatus = revisionData.ApprovalThesis;
      } else if (revisionData.approvaltheses && revisionData.approvaltheses.length > 0) {
        approvalStatus = revisionData.approvaltheses[0];
      }

      return {
        ...revisionData,
        ApprovalThesis: approvalStatus || { status: "unknown" },
      };
    });

    res.status(200).json({
      message: "Revisiones en revisión con revisor asignado obtenidas con éxito",
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
          required: false, 
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
      order: [[AssignedReview, "date_assigned", "DESC"]], // Corrección del ordenamiento
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

/**
 * The function `getReviewerHistory` retrieves the complete revision history for a specific reviewer,
 * including all comments made and the final approval status of each thesis revision.
 * @param req - The HTTP request object, containing the `user_id` (reviewer ID) as a URL parameter.
 * @param res - The HTTP response object used to return the reviewer's revision history.
 * @returns A JSON response with the reviewer's complete revision history including comments and approval status,
 * or an error message if none are found or if an internal server error occurs.
 */
const getReviewerHistory = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { order = "desc", limit = 50 } = req.query;

    const orderDirection = order === "desc" ? "DESC" : "ASC";

    // Validar que el usuario existe y es un revisor
    const reviewer = await User.findByPk(user_id);
    if (!reviewer) {
      return res.status(404).json({
        message: "Revisor no encontrado",
      });
    }

    // Verificar que el usuario tiene rol de revisor (rol_id: 6, 7)
    if (![6, 7].includes(reviewer.rol_id)) {
      return res.status(403).json({
        message: "El usuario no tiene permisos de revisor",
      });
    }

    // Obtener todas las revisiones asignadas al revisor
    const reviewerHistory = await AssignedReview.findAll({
      where: { user_id },
      attributes: ["assigned_review_id", "date_assigned"],
      include: [
        {
          model: RevisionThesis,
          attributes: ["revision_thesis_id", "date_revision", "thesis_dir", "active_process"],
          include: [
            {
              model: User, // Estudiante que envió la tesis
              attributes: ["user_id", "name", "carnet", "email", "profilePhoto"],
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
              attributes: ["status", "date_approved", "approved"],
              required: false,
            },
            {
              model: Sede,
              attributes: ["nameSede"],
            },
          ],
        },
        {
          model: CommentsRevision, // ✅ Cambiar a CommentsRevision (importado en el archivo)
          attributes: ["commentsRevision_id", "title", "comment", "date_comment"], // ✅ Usar commentsRevision_id
          required: false, // No todas las revisiones tienen comentarios
        },
      ],
      order: [["date_assigned", orderDirection]],
      limit: parseInt(limit),
    });

    // Si no hay historial de revisiones
    if (reviewerHistory.length === 0) {
      return res.status(404).json({
        message: "No se encontró historial de revisiones para este revisor",
      });
    }

    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

    // Formatear los datos del historial
    const formattedHistory = reviewerHistory.map((assignedReview) => {
      const reviewData = assignedReview.toJSON();
      const revisionThesis = reviewData.RevisionThesis;
      
      // Formatear foto de perfil del estudiante
      const studentWithPhoto = revisionThesis.User.profilePhoto 
        ? { 
            ...revisionThesis.User, 
            profilePhoto: `${BASE_URL}/public/profilephoto/${revisionThesis.User.profilePhoto}` 
          }
        : revisionThesis.User;

      // Determinar el estado en español
      let statusInSpanish = "Sin estado";
      if (revisionThesis.ApprovalThesis) {
        switch (revisionThesis.ApprovalThesis.status) {
          case "pending":
            statusInSpanish = "Pendiente";
            break;
          case "in revision":
            statusInSpanish = "En revisión";
            break;
          case "approved":
            statusInSpanish = "Aprobada";
            break;
          case "rejected":
            statusInSpanish = "Rechazada";
            break;
          default:
            statusInSpanish = revisionThesis.ApprovalThesis.status;
        }
      }

      return {
        assigned_review_id: reviewData.assigned_review_id,
        date_assigned: reviewData.date_assigned,
        revision_info: {
          revision_thesis_id: revisionThesis.revision_thesis_id,
          date_revision: revisionThesis.date_revision,
          thesis_dir: `${BASE_URL}/public${revisionThesis.thesis_dir}`,
          active_process: revisionThesis.active_process,
          sede: revisionThesis.Sede.nameSede,
        },
        student_info: {
          ...studentWithPhoto,
        },
        approval_status: {
          status: statusInSpanish,
          status_original: revisionThesis.ApprovalThesis?.status || null,
          date_approved: revisionThesis.ApprovalThesis?.date_approved || null,
          approved: revisionThesis.ApprovalThesis?.approved || null,
        },
        comments: reviewData.commentsRevisions || [], // ✅ Cambiar a commentsRevisions (plural, minúscula)
        total_comments: reviewData.commentsRevisions ? reviewData.commentsRevisions.length : 0, // ✅ Cambiar a commentsRevisions
      };
    });

    // Estadísticas del revisor
    const totalReviews = formattedHistory.length;
    const approvedCount = formattedHistory.filter(item => 
      item.approval_status.status_original === "approved"
    ).length;
    const rejectedCount = formattedHistory.filter(item => 
      item.approval_status.status_original === "rejected"
    ).length;
    const pendingCount = formattedHistory.filter(item => 
      ["pending", "in revision"].includes(item.approval_status.status_original)
    ).length;
    const totalComments = formattedHistory.reduce((sum, item) => sum + item.total_comments, 0);

    // Respuesta exitosa
    res.status(200).json({
      message: "Historial de revisiones del revisor obtenido con éxito",
      reviewer_info: {
        user_id: reviewer.user_id,
        name: reviewer.name,
        email: reviewer.email,
        profilePhoto: reviewer.profilePhoto 
          ? `${BASE_URL}/public/profilephoto/${reviewer.profilePhoto}` 
          : null,
      },
      statistics: {
        total_reviews: totalReviews,
        approved: approvedCount,
        rejected: rejectedCount,
        pending: pendingCount,
        total_comments: totalComments,
      },
      orden: orderDirection,
      data: formattedHistory,
    });
  } catch (error) {
    console.error("Error al obtener el historial del revisor:", error);
    res.status(500).json({
      message: "Error al obtener el historial del revisor",
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
  getReviewerHistory,
};
