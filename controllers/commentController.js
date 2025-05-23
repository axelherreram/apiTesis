const Task = require("../models/task");
const Comments = require("../models/comments");
const CommentVersion = require("../models/commentVersion");
const { createNotification } = require("../sql/notification");
const { addTimeline } = require("../sql/timeline");
const User = require("../models/user");
const { sendCommentEmail } = require("../services/emailService");
const { DATE } = require("sequelize");

/**
 * The function `addCommentForTask` handles the creation of comments for a specific task, validating
 * input data and ensuring proper error handling.
 * @param req - The `req` parameter in the `addCommentForTask` function represents the HTTP request
 * object, which contains information about the incoming request from the client, such as request
 * headers, parameters, body, and more. It is commonly used to access data sent from the client to the
 * server. In this
 * @param res - The `res` parameter in the `addCommentForTask` function is the response object that
 * will be used to send a response back to the client making the request. It is typically used to set
 * the status code, send JSON data, or handle errors in the response.
 * @returns The `addCommentForTask` function returns different responses based on the conditions met
 * during its execution:
 */
const addCommentForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment, role, user_id } = req.body;

    // Validaciones iniciales
    if (!taskId || isNaN(taskId)) 
      return res.status(400).json({ message: "El ID de la tarea es inválido" });

    if (!comment?.trim()) 
      return res.status(400).json({ message: "El comentario no puede estar vacío" });

    if (!["student", "teacher"].includes(role)) 
      return res.status(400).json({ message: "El rol debe ser 'student' o 'teacher'" });

    if (!user_id) 
      return res.status(400).json({ message: "El ID del usuario es requerido" });

    // Obtener la tarea y el usuario en una sola consulta
    const [task, userExist] = await Promise.all([
      Task.findOne({ where: { task_id: taskId } }),
      User.findByPk(user_id),
    ]);

    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
    if (!userExist) return res.status(404).json({ message: "Usuario no encontrado" });

    // Obtener comentario existente o crear uno nuevo
    const [existingComment, created] = await Comments.findOrCreate({
      where: { user_id, task_id: taskId },
      defaults: { user_id, task_id: taskId },
    });

    if (!created && !existingComment.comment_active) {
      return res.status(400).json({
        message: "No puedes agregar más comentarios, el comentario ha sido desactivado.",
      });
    }

    // Crear versión del comentario
    await CommentVersion.create({
      comment,
      role,
      comment_id: existingComment.comment_id,
    });

    // Construcción de notificación
    const notificationMessage =
      role === "student"
        ? `El estudiante ${userExist.name} ha comentado en la tarea ${task.title}`
        : `Tienes un nuevo comentario en la tarea ${task.title}`;

    // Notificaciones y correos según el rol
    if (role === "teacher") {
      await addTimeline(user_id, "Nuevo comentario", "Se ha agregado un nuevo comentario a la tarea", taskId);

      if (userExist.email) {
        await sendCommentEmail(
          "Nuevo comentario en tarea",
          "Se ha agregado un nuevo comentario a la tarea",
          userExist.email,
          {
            nombre: userExist.name,
            entregaTitulo: task.title,
            comentario: comment,
            fechaComentario: new Date().toLocaleString(),
          }
        );
      }
    } else {
      const teacher = await User.findOne({
        where: { sede_id: userExist.sede_id, rol_id: 3 },
      });

      if (teacher?.email) {
        await sendCommentEmail(
          "Nuevo comentario en tarea",
          "Se ha agregado un nuevo comentario a la tarea",
          teacher.email,
          {
            nombre: teacher.name,
            entregaTitulo: task?.title || "Tarea sin título",
            comentario: comment,
            fechaComentario: new Date().toLocaleDateString("es-ES"),
          }
        );
      } else {
        console.warn("No se encontró un catedrático para enviar la notificación.");
      }
    }

    // Crear notificación en la plataforma
    await createNotification(notificationMessage, userExist.sede_id, user_id, taskId, role === "student" ? "general" : "student");

    // Respuesta exitosa
    res.status(201).json({ message: "Comentario agregado exitosamente." });
  } catch (error) {
    console.error("Error al agregar comentario:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};


/**
 * The function `getAllCommentsForTaskAndUser` retrieves comments for a specific task and user, formats
 * the data, and returns it in a JSON response.
 * @param req - The `req` parameter in the `getAllCommentsForTaskAndUser` function represents the
 * request object, which contains information about the HTTP request made to the server. This object
 * includes properties such as `params`, `body`, `query`, `headers`, and more, depending on the type of
 * request
 * @param res - The `res` parameter in the `getAllCommentsForTaskAndUser` function is the response
 * object that will be used to send back the response to the client making the request. It is typically
 * used to send HTTP responses with status codes and data back to the client.
 * @returns The function `getAllCommentsForTaskAndUser` is returning a list of comments for a specific
 * task and user in a formatted structure. If comments are found for the specified task and user, the
 * function returns a JSON response with status code 200 containing the formatted comments. If no
 * comments are found, it returns a JSON response with status code 404 indicating that no comments were
 * found for the task and
 */
const getAllCommentsForTaskAndUser = async (req, res) => {
  const { taskId, userId } = req.params;

  try {
    const comments = await Comments.findAll({
      where: { task_id: taskId, user_id: userId },
      attributes: ["comment_id", "comment_active"],
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
      comment_active: comment.comment_active,
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

/**
 * The function `desactivateComment` deactivates a comment by updating its `comment_active` field to
 * false in the database.
 * @param req - The `req` parameter in the `desactivateComment` function is an object representing the
 * HTTP request. It contains information about the request made to the server, such as the request
 * parameters, body, headers, and other details. In this function, `req.params` is used to extract the
 * `
 * @param res - The `res` parameter in the `desactivateComment` function is the response object that
 * will be used to send a response back to the client making the request. It is typically used to set
 * the status code of the response and send data back to the client in the form of JSON or other
 * formats
 * @returns The `desactivateComment` function is returning a JSON response with a success message when
 * the comment deactivation is successful, or an error message with status code 404 if the comment is
 * not found, or an error message with status code 500 if there is an internal server error.
 */
const toggleCommentStatus = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comments.findOne({
      where: { comment_id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    const newStatus = !comment.comment_active;
    await Comments.update(
      { comment_active: newStatus },
      { where: { comment_id: commentId } }
    );

    res.status(200).json({ 
      message: `Comentario ${newStatus ? 'activado' : 'desactivado'}` 
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  addCommentForTask,
  getAllCommentsForTaskAndUser,
  toggleCommentStatus,
};
