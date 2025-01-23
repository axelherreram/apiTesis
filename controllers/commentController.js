const Task = require("../models/task");
const Comments = require("../models/comments");
const CommentVersion = require("../models/commentVersion");

const addCommentForTask = async (req, res) => {
  const { taskId } = req.params;
  const { comment, role, user_id } = req.body;

  try {
    if (!comment || !role || !user_id) {
      return res
        .status(400)
        .json({ message: "Comment, role, and user_id are required" });
    }

    if (!["student", "teacher"].includes(role)) {
      return res
        .status(400)
        .json({ message: "El rol debe ser 'student' o 'teacher'" });
    }

    // Obtener la tarea asociada al taskId
    const task = await Task.findOne({
      where: { task_id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    let existingComment = await Comments.findOne({
      where: { user_id: user_id, task_id: taskId },
    });

    if (!existingComment) {
      existingComment = await Comments.create({
        user_id: user_id,
        task_id: taskId,
      });
    } else if (existingComment.comment_active === false) {
      return res.status(400).json({
        message: "No se pueden crear más comentarios: Comentario desactivado",
      });
    }

    // Crear una nueva versión del comentario
    await CommentVersion.create({
      comment: comment,
      role: role,
      comment_id: existingComment.comment_id,
    });

    // Respuesta exitosa
    res.status(201).json({
      message: "Comentario agregado exitosamente.",
    });
  } catch (error) {
    console.error("Error al crear el comentario:", error.message);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

const getAllCommentsForTaskAndUser = async (req, res) => {
  const { taskId, userId } = req.params;

  try {
    const comments = await Comments.findAll({
      where: { task_id: taskId, user_id: userId },
      attributes: [],
      include: [
        {
          model: CommentVersion,
          attributes: ["comment", "datecomment", "role"],
        },
      ],
      order: [[CommentVersion, "datecomment", "DESC"]],
    });

    if (!comments.length) {
      return res.status(404).json({
        message: "No se encontraron comentarios para esta tarea y usuario.",
      });
    }

    const formattedComments = comments.map((comment) => ({
      comment_id: comment.comment_id,
      task_id: comment.task_id,
      user_id: comment.user_id,
      versions: comment.CommentVersions.map((version) => ({
        commentVersion_id: version.commentVersion_id,
        comment: version.comment,
        datecomment: version.datecomment,
        role: version.role === "student" ? "Estudiante" : "Catedratico",
      })),
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const desactivateComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comments.findOne({
      where: { comment_id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    await Comments.update(
      { comment_active: false },
      { where: { comment_id: commentId } }
    );

    res.status(200).json({ message: "Comentario desactivado" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  addCommentForTask,
  getAllCommentsForTaskAndUser,
  desactivateComment,
};
