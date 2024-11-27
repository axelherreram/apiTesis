const Course = require("../models/course");
const Task = require("../models/task");
const TimelineEventos = require("../models/timelineEventos");
const User = require("../models/user");
const { sendCommentEmail } = require("./emailController");

const listTimeline = async (req, res) => {
  const { user_id, course_id } = req.params;

  try {
    const timeline = await TimelineEventos.findAll({
      where: {
        user_id: user_id,
        course_id: course_id, // Agrega esto si necesitas filtrar por course_id
      },
      include: [
        {
          model: Course,
        },
      ],
    });

    res.json(timeline);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error en el servidor");
  }
};

const createTimeline = async (req, res) => {
  const { user_id, description, course_id, task_id } = req.body;
  const user_idAdmin = req.user_id;
  const { sede_id: tokenSedeId } = req;

  try {
    // Validar que el curso exista
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }
    // Obtener el correo del usuario
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ message: "Entrega no encontrada" });
    }

    // Validar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(user.sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a los grupos de esta sede" });
    }
    // Crear el nuevo evento en la línea de tiempo
    const newTimeline = await TimelineEventos.create({
      user_id,
      tipoEvento: "Comentario",
      descripcion: description,
      course_id,
      task_id,
      fecha: new Date(),
    });

    const userAdmin = await User.findByPk(user_idAdmin);

    // Enviar correo con el comentario al usuario
    const templateVariables = {
      nombre: user.name, // Nombre del usuario
      entregaTitulo: task.title, // Nombre del curso o entrega
      comentario: description, // Comentario realizado
      fechaComentario: new Date().toLocaleDateString(), // Fecha del comentario
      autorComentario: userAdmin.name, // Puedes reemplazarlo con el autor real
    };

    /*     await sendCommentEmail(
      'Nuevo comentario sobre tu entrega', // Asunto del correo
      `Se ha añadido un comentario sobre tu entrega en el curso ${course.name}.`, // Texto del correo en texto plano
      user.email, // Dirección de correo del usuario
      templateVariables // Variables para la plantilla de correo
    ); */

    res
      .status(201)
      .json({ message: "Evento creado exitosamente", newTimeline });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error en el servidor");
  }
};

// Exportar las funciones
module.exports = { listTimeline, createTimeline };
