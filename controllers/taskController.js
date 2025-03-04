const Task = require("../models/task");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const CourseAssignment = require("../models/courseAssignment");
const Course = require("../models/course");
const Year = require("../models/year");
const { sendEmailTask } = require("../services/emailService");
const { addTimeline } = require("../sql/timeline");
const Sede = require("../models/sede");
const TypeTask = require("../models/typeTask");
const TaskSubmissions = require("../models/taskSubmissions");
const moment = require("moment-timezone");

require("dotenv").config();

/**
 * The function `createTask` handles the creation of a new task with various validations and
 * notifications in a specific educational platform.
 * @param req - The `createTask` function you provided is an asynchronous function that handles the
 * creation of a new task based on the data received in the request (`req`) and the authenticated user
 * information. Here is a breakdown of the steps involved in the `createTask` function:
 * @param res - The `res` parameter in the `createTask` function is the response object that will be
 * used to send back the response to the client making the request. It is typically used to send HTTP
 * responses with status codes, headers, and data back to the client. In this function, you can see
 * @returns The `createTask` function returns a response based on the different validation steps and
 * operations performed during the task creation process. Here are the possible return scenarios:
 */
const createTask = async (req, res) => {
  const {
    course_id,
    sede_id,
    typeTask_id,
    title,
    description,
    taskStart,
    endTask,
    startTime,
    endTime,
  } = req.body;
  const user_id = req.user_id;
  const { sede_id: tokenSedeId } = req;

  try {
    // Paso 1: Validar que la fecha de inicio no sea mayor a la fecha final
    const formattedTaskStart = moment
      .tz(taskStart, "America/Guatemala")
      .toDate();
    const formattedEndTask = moment.tz(endTask, "America/Guatemala").toDate();

    if (formattedTaskStart > formattedEndTask) {
      return res.status(400).json({
        message:
          "La fecha de inicio de la tarea no puede ser posterior a la fecha de finalización.",
      });
    }

    // Paso 2: Validar que el sede_id en la solicitud coincida con el sede_id del token
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res.status(403).json({
        message: "No tienes permiso para acceder a esta sede.",
      });
    }

    // Paso 3: Obtener el año actual
    const currentYear = moment().tz("America/Guatemala").year();

    // Paso 4: Buscar o crear el año actual en la tabla Year
    const [yearRecord] = await Year.findOrCreate({
      where: { year: currentYear },
      defaults: { year: currentYear },
    });

    const year_id = yearRecord.year_id;

    // Paso 5: Validar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso, sede y año.",
      });
    }

    // Paso 6: Validar si el curso está activo
    if (!courseSedeAssignment.courseActive) {
      return res.status(400).json({
        message: "El curso no está activo.",
      });
    }

    const assignedCourseId = courseSedeAssignment.course_id;

    // Paso 7: Validar si el tipo de tarea es "Propuesta de tesis" y el curso no permite este tipo de tarea
    if (typeTask_id === 1 && assignedCourseId === 2) {
      return res.status(404).json({
        message:
          "No se puede crear una tarea de propuesta de tesis en este curso.",
      });
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Paso 8: Validar si ya existe una tarea de tipo "Propuesta de tesis"
    if (typeTask_id === 1) {
      const tareaExistente = await Task.findOne({
        where: { asigCourse_id, typeTask_id: 1, year_id },
      });

      if (tareaExistente) {
        return res.status(400).json({
          message:
            "Ya existe una tarea de propuesta de tesis para este curso y año.",
        });
      }
    }

    // Paso 9: Crear la nueva tarea
    const newTask = await Task.create({
      asigCourse_id,
      typeTask_id,
      title,
      description,
      taskStart: formattedTaskStart,
      endTask: formattedEndTask,
      startTime,
      endTime,
      year_id,
    });

    // Paso 10: Registrar actividad del usuario
    /*     const user = await User.findByPk(user_id);
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `Nueva tarea con título: ${title}`,
      "Creación de tarea"
    ); */

    // Paso 11: Obtener la tarea anterior
    const newTaskId = newTask.task_id;

    if (newTaskId) {
      // Paso 12 y 14: Obtener todos los estudiantes asignados al curso y enviar notificaciones
      const studentsAndEmails = await User.findAll({
        where: { rol_id: 1, sede_id, year_id },
        include: [
          {
            model: CourseAssignment,
            where: { asigCourse_id },
          },
        ],
        attributes: ["user_id", "name", "email"],
      });

      // Validar si la tarea es "Propuesta de tesis", no crear los registros de TaskSubmissions
      if (typeTask_id !== 1) {
        // Paso 13: Asignar la nueva tarea a todos los estudiantes
        for (const student of studentsAndEmails) {
          await TaskSubmissions.create({
            user_id: student.user_id,
            task_id: newTaskId,
            submission_complete: false,
          });
        }
      }

      for (const userEmail of studentsAndEmails) {
        /*       const templateVariables = {
          nombre: userEmail.name,
          titulo: title,
          descripcion: description,
          fecha: new Date().toLocaleString(),
          autor: user.name,
        };

        await sendEmailTask(
          "Nueva tarea creada: " + title,
          `Se ha creado una nueva tarea en la plataforma MyOnlineProject con el título: ${title}`,
          userEmail.email,
          templateVariables
        ); */

        const course = await Course.findByPk(courseSedeAssignment.course_id);

        await addTimeline(
          userEmail.user_id,
          "Tarea creada",
          `Se ha creado una nueva tarea en el curso: ${course.courseName} con el título: ${title}`,
          newTask.task_id
        );
      }
    }

    // Paso 15: Enviar respuesta de éxito
    res.status(201).json({
      message: "La tarea ha sido creada exitosamente.",
    });
  } catch (error) {
    // Paso 16: Manejar errores y enviar respuesta de error
    res.status(500).json({
      message: "Error al crear la tarea",
      error: error.message || error,
    });
  }
};

/**
 * The function `listTasks` retrieves tasks associated with a specific year, location, and user,
 * handling error cases appropriately.
 * @param req - The `listTasks` function is an asynchronous function that takes `req` and `res` as
 * parameters.
 * @param res - The `res` parameter in the `listTasks` function is the response object that will be
 * used to send back the response to the client making the request. It is typically used to send HTTP
 * responses with status codes and data back to the client. In the provided code snippet, you can see
 * that
 * @returns The `listTasks` function returns either a success response with a JSON array of tasks if
 * tasks are found for the specified sede and year, or an error response with a relevant message if
 * there are no tasks found, the year record is not found, there are no course assignments for the
 * specified sede and year, the user is not found, or if there is an error during the process of
 * fetching tasks
 */
const listTasks = async (req, res) => {
  const { sede_id, year } = req.params;
  const user_id = req.user_id;

  try {
    // Buscar el año en la tabla Year
    const yearRecord = await Year.findOne({ where: { year } });

    // Verificar si se encontró el año
    if (!yearRecord) {
      return res
        .status(404)
        .json({ message: `No se encontró un registro para el año ${year}.` });
    }

    const year_id = yearRecord.year_id;

    // Buscar las asignaciones de curso para la sede y el año
    const courseSedeAssignments = await CourseSedeAssignment.findAll({
      where: { sede_id, year_id, courseActive: true },
      attributes: ["asigCourse_id"],
    });

    // Verificar si existen asignaciones
    if (!courseSedeAssignments || courseSedeAssignments.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron asignaciones de cursos para la sede y año especificados.",
      });
    }

    const asigCourseIds = courseSedeAssignments.map(
      (assignment) => assignment.asigCourse_id
    );

    // Buscar las tareas asociadas a la sede y al año
    const tasks = await Task.findAll({
      where: { asigCourse_id: asigCourseIds, year_id },
    });

    // Verificar si se encontraron tareas
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        message: "No se encontraron tareas para la sede y año especificados.",
      });
    }

    // Obtener información del usuario solicitante
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Registrar actividad en la bitácora
    /*     await logActivity(
      user_id,
      user.sede_id,
      user.name,
      "Obtener todas las tareas",
      `Listó todas las tareas para la sede ${sede_id} y el año ${year}.`
    ); */

    // Devolver las tareas
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error al obtener las tareas:", error); // Registrar el error completo
    res.status(500).json({
      message: "Error al obtener las tareas",
      error: error.message || "Error desconocido", // Captura el mensaje de error
    });
  }
};

/**
 * The `listTask` function retrieves task information including CourseSedeAssignment details, validates
 * access based on sede_id, and returns the task data or appropriate error messages.
 * @param req - The `req` parameter in the `listTask` function represents the request object in
 * Express.js. It contains information about the HTTP request made to the server, including parameters,
 * headers, body, and more.
 * @param res - The `res` parameter in the `listTask` function is the response object that will be used
 * to send back the response to the client making the request. It is typically used to set the status
 * code, headers, and send data back to the client in the form of JSON, HTML, or
 * @returns If the task is found and the courseSedeAssignment's sede_id matches the tokenSedeId, a JSON
 * response with status code 200 is returned. The response includes a success message "Tarea encontrada
 * exitosamente" and the task data along with the course_id.
 */
const listTask = async (req, res) => {
  const { task_id } = req.params;
  const { sede_id: tokenSedeId } = req;

  try {
    // Buscar la tarea incluyendo la información de CourseSedeAssignment
    const task = await Task.findByPk(task_id, {
      include: [
        {
          model: CourseSedeAssignment,
          attributes: ["sede_id", "course_id"], // Incluir sede_id y course_id
        },
      ],
    });

    // Validar si la tarea existe
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Validar si la sede coincide con la sede del token
    const courseSedeAssignment = task.CourseSedeAssignment; // Sequelize incluye la relación automáticamente
    if (!courseSedeAssignment || courseSedeAssignment.sede_id !== tokenSedeId) {
      return res.status(403).json({ message: "No tienes acceso a esta tarea" });
    }

    res.status(200).json({
      message: "Tarea encontrada exitosamente.",
      data: {
        ...task.toJSON(),
        course_id: courseSedeAssignment.course_id, // Incluir course_id en la respuesta
      },
    });
  } catch (error) {
    console.error("Error al obtener la tarea:", error);
    res.status(500).json({
      message: "Error al obtener la tarea.",
      error: error.message || error,
    });
  }
};

/**
 * The function `listTasksByCourse` retrieves tasks associated with a specific course, location, and
 * year, handling various validations and error cases.
 * @param req - The function `listTasksByCourse` is an asynchronous function that takes `req` and `res`
 * as parameters. The `req` parameter typically represents the request object, which contains
 * information about the HTTP request made to the server. The `res` parameter represents the response
 * object, which is used
 * @param res - The `res` parameter in the `listTasksByCourse` function is the response object that
 * will be used to send back the response to the client making the request. It is typically used to
 * send HTTP responses with status codes, headers, and data back to the client. In this function, `
 * @returns The function `listTasksByCourse` is returning either a success response with a JSON array
 * of tasks if all the validations and database queries are successful, or an error response with a
 * relevant message if any error occurs during the process.
 */
const listTasksByCourse = async (req, res) => {
  const { sede_id, course_id, year } = req.params;
  const user_id = req.user_id;

  try {
    // Validar el año en la tabla Year
    const yearRecord = await Year.findOne({ where: { year } });
    if (!yearRecord) {
      return res
        .status(404)
        .json({ message: `No se encontró un registro para el año ${year}.` });
    }

    const year_id = yearRecord.year_id;

    // Validar que el curso exista
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res
        .status(404)
        .json({ message: `No se encontró el curso con ID ${course_id}.` });
    }

    // Validar que la sede exista
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res
        .status(404)
        .json({ message: `No se encontró la sede con ID ${sede_id}.` });
    }

    // Buscar la asignación de curso y sede para el año especificado
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso, sede y año.",
      });
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Buscar todas las tareas asociadas a la asignación de curso, sede y año
    const tasks = await Task.findAll({
      where: { asigCourse_id, year_id },
    });

    // Verificar si se encontraron tareas
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron tareas para el curso, sede y año especificados.",
      });
    }

    // Obtener información del usuario solicitante
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Registrar actividad en la bitácora
    /*     await logActivity(
      user_id,
      user.sede_id,
      user.name,
      "Obtener todas las tareas",
      `Listó todas las tareas del curso con ID ${course_id} para la sede ${sede_id} en el año ${year}`
    ); */

    // Responder con las tareas encontradas
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
    res.status(500).json({
      message: "Error al obtener las tareas",
      error: error.message || "Error desconocido",
    });
  }
};

/**
 * The function `updateTask` is an asynchronous function in JavaScript that updates a task based on the
 * provided request parameters and body, performing various validations and logging activities along
 * the way.
 * @param req - The `req` parameter in the `updateTask` function represents the request object in
 * Express.js. It contains information about the HTTP request made to the server, including request
 * parameters, body, headers, and user authentication details.
 * @param res - The `res` parameter in the `updateTask` function is the response object that will be
 * used to send a response back to the client making the request. It is typically used to send HTTP
 * responses with status codes, headers, and data back to the client. In the provided code snippet, `
 * @returns The `updateTask` function returns a JSON response with a success message "Tarea actualizada
 * exitosamente" if the task is successfully updated. If there are any errors during the update
 * process, it returns a JSON response with an error message "Error al actualizar la tarea" along with
 * the specific error message or "Error desconocido" if the error message is not available.
 */
const updateTask = async (req, res) => {
  const { task_id } = req.params;
  const { title, description, taskStart, endTask, startTime, endTime } = req.body;
  const user_id = req.user_id;
  const { sede_id: tokenSedeId } = req; // Extraer sede_id del token

  try {
    // Validar que la tarea exista
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Validar la asignación de curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id: task.asigCourse_id },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida para la tarea.",
      });
    }

    // Validar que el sede_id de la tarea coincida con el del token
    if (
      parseInt(courseSedeAssignment.sede_id, 10) !== parseInt(tokenSedeId, 10)
    ) {
      return res.status(403).json({ message: "No tienes acceso a esta tarea" });
    }

    // Validar si el curso está inactivo
    if (!courseSedeAssignment.courseActive) {
      return res.status(400).json({
        message:
          "No se puede actualizar la tarea ya que el curso está inactivo.",
      });
    }

    // Validar que las fechas sean consistentes si se actualizan
    let formattedTaskStart = task.taskStart;
    let formattedEndTask = task.endTask;

    if (taskStart) {
      formattedTaskStart = moment.tz(taskStart, "America/Guatemala").toDate();
    }

    if (endTask) {
      formattedEndTask = moment.tz(endTask, "America/Guatemala").toDate();
    }

    if (formattedTaskStart > formattedEndTask) {
      return res.status(400).json({
        message:
          "La fecha de inicio de la tarea no puede ser posterior a la fecha de finalización.",
      });
    }

    // Actualizar la tarea con los nuevos campos
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.taskStart = formattedTaskStart;
    task.endTask = formattedEndTask;
    task.startTime = startTime ?? task.startTime;
    task.endTime = endTime ?? task.endTime;

    // Registrar la actividad del usuario
    const user = await User.findByPk(user_id);
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `Actualizó tarea con título: ${task.title}`,
      "Se actualizó tarea"
    );

    await task.save();

    res.status(200).json({ message: "Tarea actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    res.status(500).json({
      message: "Error al actualizar la tarea",
      error: error.message || "Error desconocido",
    });
  }
};


module.exports = {
  createTask,
  listTasks,
  listTask,
  updateTask,
  listTasksByCourse,
};
