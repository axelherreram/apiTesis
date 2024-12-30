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

    // Fecha actual ajustada a día, mes y año (sin hora)
    const currentDateTime = new Date();
    currentDateTime.setHours(0, 0, 0, 0);

    // Convertir taskStart y endTask en objetos Date ajustados a día, mes y año
    const taskStartDate = new Date(task.taskStart);
    taskStartDate.setHours(0, 0, 0, 0);
    const taskEndDate = new Date(task.endTask);
    taskEndDate.setHours(0, 0, 0, 0);

    // Convertir las horas de inicio y fin en objetos Date
    const [startHour, startMinute, startSecond] = task.startTime.split(":").map(Number);
    const [endHour, endMinute, endSecond] = task.endTime.split(":").map(Number);

    const startTime = new Date();
    startTime.setHours(startHour, startMinute, startSecond);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, endSecond);

    // Validar la fecha y hora actual contra las fechas y horas de inicio y fin
    if (
      currentDateTime < taskStartDate ||
      currentDateTime > taskEndDate ||
      new Date() < startTime ||
      new Date() > endTime
    ) {
      return res.status(400).json({
        message: "El comentario solo se puede agregar, fuera de horario de la tarea.",
        debug: {
          currentDateTime: currentDateTime.toISOString(),
          taskStartDateTime: taskStartDate.toISOString(),
          taskEndDateTime: taskEndDate.toISOString(),
          currentTime: new Date().toTimeString(),
          startTime: startTime.toTimeString(),
          endTime: endTime.toTimeString(),
        },
      });
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
        role: version.role === "student" ? "Estudiante" : "Catedratico",
      })),
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


module.exports = {
  addCommentForTask,
  getAllCommentsForTaskAndUser,
};