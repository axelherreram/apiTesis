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
    const { user_id, sede_id } = req.body;

    // Verificar si ambos archivos fueron subidos
    if (!req.files || !req.files["approval_letter"] || !req.files["thesis"]) {
      return res.status(400).json({
        message: "Se requieren ambos archivos (carta de aprobación y tesis)",
      });
    }

    // Desestructurar los archivos subidos
    const { approval_letter, thesis } = req.files;

    // Obtener las rutas de los archivos subidos
    approval_letter_dir = `/uploads/revisionthesis/${approval_letter[0].filename}`;
    thesis_dir = `/uploads/revisionthesis/${thesis[0].filename}`;

    // Validar que el usuario exista
    const userInfo = await User.findByPk(user_id);
    if (!userInfo) {
      throw new Error("Usuario no encontrado");
    }

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
        `El estudiante ya tiene un proceso de revisión activo en la sede ${sedeInfo.nameSede}`
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

const getPendingRevisions = async (req, res) => {
  try {
    const { order = "asc", carnet, name } = req.query;

    const orderDirection = order === "desc" ? "DESC" : "ASC";

    const userWhereClause = {};
    if (carnet) userWhereClause.carnet = carnet;
    if (name) userWhereClause.name = { [Op.like]: `%${name}%` };

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
          attributes: ["user_id","name", "carnet"],
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


    res.status(200).json({
      message: "Revisiones de tesis pendientes sin asignar obtenidas con éxito",
      orden: orderDirection,
      data: pendingRevisions,
    });
  } catch (error) {
    console.error("Error al obtener las revisiones pendientes:", error);
    res.status(500).json({
      message: "Error al obtener las revisiones pendientes",
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
      attributes: ["revision_thesis_id", "thesis_dir", "date_revision", "active_process"],
      include: [
        {
          model: ApprovalThesis,
          where: { status: "pending" }, // Solo revisiones con estado "pending"
          attributes: [],
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
            }
          ],
        },
        {
          model: AssignedReview,
          attributes: ["assigned_review_id"],
          required: false, // No es obligatorio que haya asignaciones
        },
      ],
    });

    // Si no hay revisiones para el estudiante
    if (revisions.length === 0) {
      return res.status(404).json({
        message: "No se encontraron revisiones para el estudiante",
      });
    }

    // Filtrar revisiones que no tengan un revisor asignado
    const filteredRevisions = revisions.filter((revision) => {
      // Verificar que no haya registros en AssignedReview
      return revision.AssignedReviews.length === 0;
    });

    // Si no hay revisiones que cumplan con los filtros
    if (filteredRevisions.length === 0) {
      return res.status(404).json({
        message: "No se encontraron revisiones pendientes sin asignar para el estudiante",
      });
    }

    // Mapear los datos para agregar el baseURL a thesis_dir
    const mappedRevisions = filteredRevisions.map((revision) => ({
      ...revision.toJSON(), // Convertir a objeto plano
      thesis_dir: `${process.env.BASE_URL || "http://localhost:3000"}${
        revision.thesis_dir
      }`,
    }));

    // Respuesta exitosa
    res.status(200).json({
      message: "Revisiones pendientes sin asignar del estudiante obtenidas con éxito",
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

module.exports = { uploadRevisionThesis, getPendingRevisions, getRevisionsByUserId };
