const { Op } = require("sequelize");
const Task = require("../models/task");
const Comments = require("../models/comments");
const CommentVersion = require("../models/commentVersion");

const addCommentForTask = async (req, res) => {
  const { taskId } = req.params;
  const { comment, role, user_id } = req.body;

  try {
    if (!comment || !role || !user_id) {
      return res.status(400).json({ message: "Comment, role, and user_id are required" });
    }

    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "El rol debe ser 'student' o 'teacher'" });
    }

    // Obtener la tarea asociada al taskId
    const task = await Task.findOne({
      where: { task_id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Verificar si la fecha actual está dentro del rango de taskStart y endTask
    const currentDate = new Date();

    if (currentDate < new Date(task.taskStart) || currentDate > new Date(task.endTask)) {
      return res.status(400).json({ message: "El comentario solo se puede agregar entre las fechas de inicio y fin de la tarea" });
    }

    // Verificar si la hora actual está dentro del rango de startTime y endTime
    const currentTime = currentDate.toTimeString().split(' ')[0]; // Obtener solo la hora y minutos

    if (currentTime < task.startTime || currentTime > task.endTime) {
      return res.status(400).json({ message: "El comentario solo se puede agregar durante el horario de la tarea" });
    }

    // Verificar si ya existe un comentario con el mismo user_id y task_id
    let existingComment = await Comments.findOne({
      where: { user_id: user_id, task_id: taskId },
    });

    if (!existingComment) {
      // Crear un nuevo comentario si no existe
      existingComment = await Comments.create({
        user_id: user_id,
        task_id: taskId,
      });
    }

    // Crear una nueva versión del comentario
    await CommentVersion.create({
      comment: comment,
      datecomment: new Date(),
      role: role,
      comment_id: existingComment.comment_id,
    });

    res.status(201).json({ message: "Comentario agregado exitosamente." });
  } catch (error) {
    console.error("Error al crear el comentario:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// Controlador para obtener todos los comentarios de una tarea y un user_id específico
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
      return res.status(404).json({ message: "No se encontraron comentarios para esta tarea y usuario." });
    }

    const formattedComments = comments.map((comment) => ({
      comment_id: comment.comment_id,
      task_id: comment.task_id,
      user_id: comment.user_id,
      versions: comment.CommentVersions.map((version) => ({
        commentVersion_id: version.commentVersion_id,
        comment: version.comment,
        datecomment: version.datecomment,
        role: version.role,
      })),
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    console.error("Error al obtener comentarios:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


module.exports = {
  addCommentForTask,
  getAllCommentsForTaskAndUser,
};