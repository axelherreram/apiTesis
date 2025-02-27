const { sequelize } = require("../config/database");
const CommentRevision = require("../models/commentsRevisionThesis");
const RevisionThesis = require("../models/revisionThesis");
const AssignedReview = require("../models/assignedReviewthesis");
const ApprovalThesis = require("../models/approvalThesis");
const moment = require("moment-timezone");

/**
 * The function `createCommentRevision` handles the creation of a comment on a thesis revision,
 * updates the thesis approval status, and deactivates the revision process.
 * It ensures transactional consistency using Sequelize transactions.
 *
 * @param req - The HTTP request object containing `assigned_review_id`, `title`, `comment`, and `status` in the body.
 * @param res - The HTTP response object used to return the created comment or an error message.
 * @returns A JSON response confirming the successful creation of the comment or an error message in case of failure.
 */
const createCommentRevision = async (req, res) => {
  const transaction = await sequelize.transaction(); // Iniciar una transacción
  try {
    const { assigned_review_id, title, comment, status } = req.body;

    // Validar que se proporcionen todos los campos requeridos
    if (!assigned_review_id || !title || !comment || status === undefined) {
      return res.status(400).json({
        message:
          "Todos los campos son requeridos: assigned_review_id, title, comment, status",
      });
    }

    // Validar que el estado sea 0 o 1
    if (status !== 0 && status !== 1) {
      return res.status(400).json({
        message: "El estado debe ser 0 (rechazado) o 1 (aprobado)",
      });
    }

    // Convertir el estado a booleano
    const isApproved = status === 1; // 1 = true (aprobado), 0 = false (rechazado)

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

    // Obtener el ID de la tesis de revisión
    const revision_thesis_id = assignedReview.revision_thesis_id;

    /*     // Validar que no exista ya un comentario para esta revisión asignada
    const existingComment = await CommentRevision.findOne({
      where: { assigned_review_id },
      transaction,
    });

    if (existingComment) {
      await transaction.rollback();
      return res.status(409).json({
        message: "Ya existe un comentario para esta revisión asignada.",
      });
    } */

    // Desactivar el proceso de revisión
    const revision = await RevisionThesis.update(
      {
        active_process: false,
      },
      {
        where: { revision_thesis_id },
        transaction,
      }
    );
    
    // Verificar si alguna fila fue actualizada
    if (revision[0] === 0) {
      return res.status(400).json({
        message: "El proceso de revisión ya ha sido desactivado",
      });
    }

    // Actualizar el estado de la aprobación
    await ApprovalThesis.update(
      {
        status: isApproved ? "approved" : "rejected",
        approved: isApproved,
        date_approved: moment()
          .tz("America/Guatemala")
          .format("YYYY-MM-DD HH:mm:ss"),
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
        date_comment: moment()
          .tz("America/Guatemala")
          .format("YYYY-MM-DD HH:mm:ss"),
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
