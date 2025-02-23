const { sequelize } = require("../config/database");
const CommentRevision = require("../models/commentsRevisionThesis");
const RevisionThesis = require("../models/revisionThesis");
const AssignedReview = require("../models/assignedReviewthesis");
const ApprovalThesis = require("../models/approvalThesis");

const createCommentRevision = async (req, res) => {
  const transaction = await sequelize.transaction(); // Iniciar una transacción
  try {
    const { assigned_review_id, title, comment, status } = req.body;

    // Validar que se proporcionen todos los campos requeridos
    if (!assigned_review_id || !title || !comment || !status) {
      return res.status(400).json({
        message:
          "Todos los campos son requeridos: assigned_review_id, title, comment, state",
      });
    }

    // Validar que el estado sea válido
    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({
        message: "Estado inválido. Los estados válidos son: approved, rejected",
      });
    }

    // Validar que la revisión asignada exista
    const assignedReview = await AssignedReview.findByPk(assigned_review_id, {
      transaction,
    });
    if (!assignedReview) {
      await transaction.rollback(); // Revertir la transacción
      return res.status(404).json({
        message: "Revisión asignada no encontrada",
      });
    }

    // obtener el id de la tesis de revisión
    const revision_thesis_id = assignedReview.revision_thesis_id;

    // Desactivar el proceso de revisión
    await RevisionThesis.update(
      {
        active_process: false,
      },
      {
        where: { revision_thesis_id },
        transaction,
      }
    );

    // Actualizar el estado de la aprobación
    await ApprovalThesis.update(
      {
        status: status,
        approved: status === "approved", // Establecer approved en true si el estado es "approved"
        date_approved: new Date(),
      },
      {
        where: { revision_thesis_id },
        transaction,
      }
    );

    // Crear el comentario
    const newComment = await CommentRevision.create(
      {
        assigned_review_id,
        title,
        comment,
      },
      { transaction }
    );

    await transaction.commit(); // Confirmar la transacción

    // Respuesta exitosa
    res.status(201).json({
      message: "Comentario creado con éxito",
      data: newComment, // Devolver el comentario creado
    });
  } catch (error) {
    await transaction.rollback(); // Revertir la transacción en caso de error
    console.error("Error al crear el comentario:", error);
    res.status(500).json({
      message: "Error al crear el comentario",
      error: error.message,
    });
  }
};

module.exports = { createCommentRevision };
