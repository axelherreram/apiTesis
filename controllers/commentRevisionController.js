const { sequelize } = require("../config/database");
const CommentRevision = require("../models/commentsRevisionThesis");
const RevisionThesis = require("../models/revisionThesis");
const AssignedReview = require("../models/assignedReviewthesis");
const ApprovalThesis = require("../models/approvalThesis");
const moment = require("moment-timezone");
const {
  sendEmailCommentRevisionAproved,
  sendEmailCommentRevisionRejected,
} = require("../services/emailService");
const User = require("../models/user");

/**
 * The function `createCommentRevision` handles the creation of a comment on a thesis revision,
 * updates the thesis approval status, and deactivates the revision process.
 * It ensures transactional consistency using Sequelize transactions.
 *
 * @param req - The HTTP request object containing `revision_thesis_id`, `title`, `comment`, and `status` in the body.
 * @param res - The HTTP response object used to return the created comment or an error message.
 * @returns A JSON response confirming the successful creation of the comment or an error message in case of failure.
 */
const createCommentRevision = async (req, res) => {
  const transaction = await sequelize.transaction(); // Iniciar transacción
  try {
    const { revision_thesis_id, title, comment, status } = req.body;
    const { user_id: revisor_id } = req.user;

    // Validar que se proporcionen todos los campos requeridos
    if (!revision_thesis_id || !title || !comment || status == null) {
      return res.status(400).json({
        message:
          "Todos los campos son requeridos: revision_thesis_id, title, comment, status",
      });
    }
    // Validar que el estado sea 0 o 1
    if (![0, 1].includes(status)) {
      return res.status(400).json({
        message: "El estado debe ser 0 (rechazado) o 1 (aprobado)",
      });
    }

    // Convertir el estado a booleano
    const isApproved = status === 1;

    // Validar que la revisión de tesis exista
    const revisionThesis = await RevisionThesis.findByPk(revision_thesis_id, {
      include: [{ model: AssignedReview, attributes: ["assigned_review_id"] }],
      transaction,
    });

    if (!revisionThesis || !revisionThesis.AssignedReviews.length) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Revisión de tesis no encontrada",
      });
    }

    const assigned_review_id =
      revisionThesis.AssignedReviews[0].assigned_review_id;

    if (revisionThesis.AssignedReviews[0].user_id !== revisor_id) {
      await transaction.rollback();
      return res.status(403).json({
        message: "No tienes permiso para comentar esta revisión. Solo la persona asignada puede comentar.",
      });
    }

    // Desactivar el proceso de revisión
    const revision = await RevisionThesis.update(
      { active_process: false },
      { where: { revision_thesis_id }, transaction }
    );

    // Verificar si alguna fila fue actualizada
    if (revision[0] === 0) {
      await transaction.rollback(); // Asegurar rollback en caso de error
      return res.status(400).json({
        message: "El proceso de revisión ya ha sido desactivado",
      });
    }

    // Actualizar el estado de aprobación
    await ApprovalThesis.update(
      {
        status: isApproved ? "approved" : "rejected",
        approved: isApproved,
        date_approved: moment()
          .tz("America/Guatemala")
          .format("YYYY-MM-DD HH:mm:ss"),
      },
      { where: { revision_thesis_id }, transaction }
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

    // Obtener datos del estudiante
    const data_student = await RevisionThesis.findOne({
      where: { revision_thesis_id },
      include: {
        model: User,
        attributes: ["email", "name"],
      },
    });

    // Verificar que `data_student` tenga datos
    if (!data_student || !data_student.User) {
      await transaction.rollback();
      return res.status(404).json({
        message:
          "No se encontró información del estudiante asociado a la revisión.",
      });
    }

    // Enviar correo electrónico al estudiante
    const templateVariables = {
      student_name: data_student.User.name,
      title,
      comment,
      date: moment(newComment.date_comment).format("DD/MM/YYYY"),
      status_message: isApproved ? "Aprobada" : "Rechazada",
      custom_message: isApproved
        ? "¡Felicitaciones! Tu tesis ha sido aprobada. Puedes proceder con los siguientes pasos."
        : "Tu tesis ha sido rechazada. Por favor revisa los comentarios y realiza las correcciones necesarias y comunicate con tu catedrático correspondiente.",
    };

    // Enviar correo electrónico
    if (isApproved) {
      await sendEmailCommentRevisionAproved(
        "Comentario de revisión de tesis",
        data_student.User.email,
        templateVariables
      );
    } else {
      await sendEmailCommentRevisionRejected(
        "Comentario de revisión de tesis",
        data_student.User.email,
        templateVariables
      );
    }

    await transaction.commit(); // Confirmar la transacción

    // Respuesta exitosa
    res.status(201).json({
      message: "Comentario creado con éxito",
      data: newComment,
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
