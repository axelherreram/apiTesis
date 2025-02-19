const fs = require("fs"); // Módulo para manejar archivos
const path = require("path");
const RevisionThesis = require("../models/revisionThesis");
const Sede = require("../models/sede");
const User = require("../models/user");
const ApprovalThesis = require("../models/approvalThesis");
const { Op } = require("sequelize");
const AssignedReview = require("../models/assignedReviewthesis");
const Year = require("../models/year");

const uploadRevisionThesis = async (req, res) => {
  let approval_letter_dir = null;
  let thesis_dir = null;
  try {
    const { carnet, sede_id } = req.body;

    // Verificar si ambos archivos fueron subidos
    if (!req.files || !req.files["approval_letter"] || !req.files["thesis"]) {
      throw new Error("Se requieren ambos archivos (carta de aprobación y tesis)",);
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
    const userRevision = await RevisionThesis.findOne({
      where: { user_id },
    });

    if (userRevision && userRevision.active_process) {
      throw new Error(
        `El estudiante ya tiene cuenta con un proceso de revisión activo en la sede ${sedeInfo.nameSede}`
      );
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
      thesis_dir: `${process.env.BASE_URL+"/public" || "http://localhost:3000/public"}${
        revision.thesis_dir
      }`,
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

const getPendingRevisions = async (req, res) => {
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

    const pendingRevisions = await RevisionThesis.findAll({
      attributes: ["revision_thesis_id", "date_revision"],
      where: { active_process: true },
      include: [
        {
          model: ApprovalThesis,
          where: { status: "pending" },
          attributes: ["status"],
        },
        {
          model: User,
          attributes: ["user_id", "name", "carnet"],
          where: userWhereClause,
        },
        {
          model: AssignedReview,
          attributes: [],
          required: false,
        },
      ],
      where: {
        "$AssignedReviews.assigned_review_id$": null,
      },
      order: [["date_revision", orderDirection]],
    });

    if (pendingRevisions.length === 0) {
      return res.status(404).json({
        message: "No hay revisiones de tesis pendientes sin asignar",
      });
    }

    // Convertir el estado "pending" a "pendiente"
    const formattedRevisions = pendingRevisions.map((revision) => ({
      ...revision.toJSON(),
      ApprovalThesis: {
        ...revision.ApprovalThesis,
        status: "pendiente",
      },
    }));

    res.status(200).json({
      message: "Revisiones de tesis pendientes sin asignar obtenidas con éxito",
      orden: orderDirection,
      data: formattedRevisions,
    });
  } catch (error) {
    console.error("Error al obtener las revisiones pendientes:", error);
    res.status(500).json({
      message: "Error al obtener las revisiones pendientes",
      error: error.message,
    });
  }
};

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
      return res
        .status(404)
        .json({
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

module.exports = {
  uploadRevisionThesis,
  getPendingRevisions,
  getRevisionsByUserId,
  getRevisionsInReview,
};
