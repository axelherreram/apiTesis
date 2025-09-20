const TaskSubmission = require("../models/taskSubmissions");
const Task = require("../models/task");
const User = require("../models/user");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const TaskSubmissions = require("../models/taskSubmissions");
const CourseAssignment = require("../models/courseAssignment");
const Year = require("../models/year");
const { addTimeline } = require("../sql/timeline");
const Sede = require("../models/sede");
const Course = require("../models/course");
const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

const { createNotification } = require("../sql/notification");
const { sendEmailConfirmDelivery } = require("../services/emailService");

/**
 * Crea o actualiza una entrega de tarea con archivo PDF
 * @param {Object} req - Debe contener user_id, task_id y file (archivo PDF)
 * @param {Object} res
 */
const createTaskSubmission = async (req, res) => {
  const { user_id, task_id } = req.body;

  // Validar que los campos requeridos existan
  if (!user_id || !task_id) {
    // Eliminar el archivo subido si faltan campos requeridos
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(`Error al eliminar el archivo PDF: ${err.message}`);
        }
      });
    }

    return res.status(400).json({
      message: "Faltan campos requeridos: user_id y task_id son obligatorios",
    });
  }

  // Verificar que se haya subido un archivo
  if (!req.file) {
    return res.status(400).json({
      message: "Se requiere subir un archivo PDF",
    });
  }

  try {
    // Verificar si el usuario existe
    const userExist = await User.findByPk(user_id);
    if (!userExist) {
      // Eliminar el archivo si el usuario no existe
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo PDF: ${err.message}`);
          }
        });
      }

      return res.status(404).json({
        message: "El usuario no existe",
      });
    }

    // Verificar si la tarea existe
    const taskExist = await Task.findByPk(task_id);
    if (!taskExist) {
      // Eliminar el archivo si la tarea no existe
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo PDF: ${err.message}`);
          }
        });
      }

      return res.status(404).json({
        message: "La tarea no existe",
      });
    }

    // ...existing code...

    // Configurar zona horaria
    const timeZone = "America/Guatemala";
    const currentDateTime = moment.tz(timeZone);

    // Convertir fechas de la tarea a la zona horaria correcta
    const taskStart = moment.tz(taskExist.taskStart, timeZone);
    const endTask = moment.tz(taskExist.endTask, timeZone);

    // Validar rango de fechas (sin considerar horas)
    const isDateValid = currentDateTime.isBetween(
      taskStart,
      endTask,
      "day",
      "[]"
    );

    if (!isDateValid) {
      // Eliminar el archivo si está fuera del rango de fechas permitido
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo PDF: ${err.message}`);
          }
        });
      }

      return res.status(400).json({
        message:
          "La tarea no puede ser entregada fuera del rango de fechas permitido",
        debug: {
          currentDateTime: currentDateTime.format(),
          taskStart: taskStart.format(),
          endTask: endTask.format(),
        },
      });
    }

    // Solo validar horario si es el primer o último día
    const isFirstDay = currentDateTime.isSame(taskStart, "day");
    const isLastDay = currentDateTime.isSame(endTask, "day");

    if (isFirstDay || isLastDay) {
      // Extraer las horas y minutos de la tarea
      const startTimeParts = taskExist.startTime.split(":");
      const endTimeParts = taskExist.endTime.split(":");

      // Crear objetos moment para la hora actual y las horas de inicio/fin
      const startTime = moment(currentDateTime).set({
        hour: parseInt(startTimeParts[0], 10),
        minute: parseInt(startTimeParts[1], 10),
        second: 0,
      });
      const endTime = moment(currentDateTime).set({
        hour: parseInt(endTimeParts[0], 10),
        minute: parseInt(endTimeParts[1], 10),
        second: 0,
      });

      // Validar si la hora actual está dentro del rango de horas permitido
      const isTimeValid = currentDateTime.isBetween(
        startTime,
        endTime,
        null,
        "[]"
      );

      if (!isTimeValid) {
        // Eliminar el archivo si está fuera del rango de horas permitido
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error(`Error al eliminar el archivo PDF: ${err.message}`);
            }
          });
        }

        return res.status(400).json({
          message:
            "La tarea no puede ser entregada fuera del horario permitido",
        });
      }
    }

    // ...existing code...

    // Buscar si ya existe una entrega
    let taskSubmissionExist = await TaskSubmission.findOne({
      where: { user_id, task_id },
    });

    /*     if (taskSubmissionExist?.submission_complete) {
      // Eliminar el archivo si ya existe una entrega completa
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo PDF: ${err.message}`);
          }
        });
      }

      return res.status(400).json({ 
        message: "La tarea ya ha sido entregada. Use el endpoint de actualización para cambiar el archivo." 
      });
    } */

    let isUpdate = false;

    // Si no existe, crear la entrega
    if (!taskSubmissionExist) {
      taskSubmissionExist = await TaskSubmission.create({
        user_id,
        task_id,
        submission_complete: true,
        file_path: req.file.path,
        date: new Date(),
      });
    } else {
      // Si ya existe, actualizar la entrega
      isUpdate = true;

      // Eliminar archivo anterior si existe
      if (taskSubmissionExist.file_path) {
        fs.unlink(taskSubmissionExist.file_path, (err) => {
          if (err) {
            console.error(
              `Error al eliminar el archivo anterior: ${err.message}`
            );
          }
        });
      }

      await taskSubmissionExist.update({
        submission_complete: true,
        file_path: req.file.path,
        date: new Date(),
      });
    }

    // Crear la línea de tiempo
    await addTimeline(
      userExist.user_id,
      isUpdate ? "Tarea de envío actualizada" : "Tarea de envío confirmada",
      `${
        isUpdate ? "Actualización" : "Confirmación"
      } de entrega para la tarea: ${taskExist.title}`,
      taskExist.task_id
    );

    // Crear la notificación
    await createNotification(
      `El estudiante ${userExist.name} ha ${
        isUpdate ? "actualizado" : "confirmado"
      } la entrega de la tarea: ${taskExist.title}`,
      userExist.sede_id,
      user_id,
      task_id,
      "general"
    );

    // Recuperar administrador/catedrático de la sede
    const teacher = await User.findOne({
      where: { sede_id: userExist.sede_id, rol_id: 3 },
    });

    if (teacher) {
      // Enviar correo electrónico de confirmación de entrega
      const templateVariables = {
        catedraticoNombre: teacher.name,
        studentName: userExist.name,
        chapterTitle: taskExist.title,
        deliveryDate: moment()
          .tz("America/Guatemala")
          .format("DD/MM/YYYY, h:mm A"),
        stateDelivery: "Entregado",
      };

      await sendEmailConfirmDelivery(
        "Confirmación de Entrega",
        teacher.email,
        templateVariables
      );
    }

    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const normalizedPath = (req.file.path || "").replace(/\\/g, "/");
    const publicFileUrl = encodeURI(`${BASE_URL}/${normalizedPath}`);

    return res.status(isUpdate ? 200 : 201).json({
      message: isUpdate
        ? "Tarea de envío actualizada exitosamente"
        : "Tarea de envío creada exitosamente",
      file_path: publicFileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    // Eliminar el archivo si ocurre un error en la base de datos
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(`Error al eliminar el archivo PDF: ${err.message}`);
        }
      });
    }

    console.error("Error al procesar la entrega de tarea:", error);
    res.status(500).json({
      message: "Error en el servidor al procesar la entrega de la tarea",
      error: error.message,
    });
  }
};

/**
 * The function `getCourseDetails` retrieves information about a specific course, including students
 * assigned to the course, tasks, and task submissions, handling errors if any occur.
 * @param req - The `req` parameter in the `getCourseDetails` function stands for the request object,
 * which contains information about the HTTP request that triggered the function. This object typically
 * includes details such as request headers, parameters, body, query parameters, and more.
 * @param res - The function `getCourseDetails` is an asynchronous function that retrieves details of a
 * course based on the provided parameters. Here's a breakdown of the function:
 * @returns The `getCourseDetails` function is returning course details including the course name, sede
 * name, and information about students assigned to the course along with their task submissions. The
 * response includes the course name, sede name, and an array of student objects with their name,
 * email, carnet, and an array of task submissions with details like title, submission completion
 * status, and date.
 */
const getCourseDetails = async (req, res) => {
  const { course_id, sede_id, year } = req.params;

  try {
    const yearRecord = await Year.findOne({
      where: { year },
    });

    if (!yearRecord) {
      return res.status(404).json({
        message: "No se encontró el año especificado",
      });
    }

    const year_id = yearRecord.year_id;

    // Paso 1: Validar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
      include: [
        {
          model: Course,
          attributes: ["courseName"], // Incluir el nombre del curso
        },
      ],
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede",
      });
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id;
    const courseName = courseSedeAssignment.Course?.courseName;

    const infoSede = await Sede.findOne({
      where: { sede_id },
    });
    const nameSede = infoSede.nameSede;

    // Paso 2: Obtener todos los estudiantes asignados al curso
    const students = await User.findAll({
      where: { rol_id: 1, sede_id },
      include: [
        {
          model: CourseAssignment,
          where: { asigCourse_id },
        },
      ],
      attributes: ["user_id", "name", "email", "carnet"],
    });

    // Paso 3: Obtener todas las tareas del curso
    const tasks = await Task.findAll({
      where: { asigCourse_id },
      attributes: ["task_id", "title", "description", "taskStart", "endTask"],
    });

    // Paso 4: Obtener las entregas de tareas de los estudiantes
    const studentTasks = await Promise.all(
      students.map(async (student) => {
        const submissions = await TaskSubmissions.findAll({
          where: { user_id: student.user_id },
          attributes: ["task_id", "submission_complete", "date"],
          include: [
            {
              model: Task,
              attributes: ["title"], // Incluir el título de la tarea
            },
          ],
        });

        const formattedSubmissions = submissions.map((submission) => ({
          title: submission.Task?.title, // Agregar el título de la tarea
          submission_complete: submission.submission_complete,
          date: submission.date,
        }));

        return {
          student: {
            name: student.name,
            email: student.email,
            carnet: student.carnet,
          },
          submissions: formattedSubmissions,
        };
      })
    );

    // Paso 5: Enviar la respuesta con los detalles del curso
    res.status(200).json({
      course: courseName,
      sede: nameSede,
      students: studentTasks,
    });
  } catch (error) {
    // Paso 6: Manejo de errores del servidor
    res.status(500).json({
      message: "Error al obtener la información del curso",
      error: error.message || error,
    });
  }
};

/**
 * The function `getStudentCourseDetails` retrieves course details and task submissions for a student
 * based on provided parameters.
 * @param req - The function `getStudentCourseDetails` is an asynchronous function that takes `req` and
 * `res` as parameters. In an Express.js application, `req` represents the request object containing
 * information about the HTTP request, and `res` represents the response object used to send the
 * response back to the
 * @param res - The `res` parameter in the `getStudentCourseDetails` function is the response object
 * that will be used to send back the response to the client making the request. It is typically used
 * to send HTTP responses with data or error messages back to the client.
 * @returns The function `getStudentCourseDetails` returns the details of a student's course and their
 * task submissions. If successful, it returns an object with the student's name, email, carnet, sede
 * (campus), course name, and an array of formatted task submissions. If there are any errors during
 * the process, it returns an error message along with the status code 500.
 */
const getStudentCourseDetails = async (req, res) => {
  const { user_id, course_id, sede_id, year } = req.params;

  try {
    // Paso 1: Verificar si el estudiante existe
    const student = await User.findByPk(user_id);
    if (!student) {
      return res.status(404).json({ message: "El estudiante no existe" });
    }

    // Paso 2: Verificar si el año existe
    const yearRecord = await Year.findOne({
      where: { year },
    });
    if (!yearRecord) {
      return res.status(404).json({ message: "El año no existe" });
    }
    const year_id = yearRecord.year_id;

    // Paso 3: Validar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
      include: [
        {
          model: Course,
          attributes: ["courseName"],
        },
      ],
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede",
      });
    }

    // Obtener el nombre del curso
    const courseName = courseSedeAssignment.Course.courseName;

    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Paso 4: Verificar si el estudiante está asignado al curso
    const courseAssignment = await CourseAssignment.findOne({
      where: { student_id: user_id, asigCourse_id },
    });
    if (!courseAssignment) {
      return res.status(404).json({
        message: "El estudiante no está asignado a este curso",
      });
    }

    // Obtener la sede del estudiante
    const SedeInfo = await Sede.findOne({
      where: { sede_id },
    });

    // Paso 5: Obtener todas las tareas del curso
    const tasks = await Task.findAll({
      where: { asigCourse_id },
      attributes: ["task_id"],
    });

    // Paso 6: Obtener las entregas de tareas del estudiante filtradas por curso
    const submissions = await TaskSubmissions.findAll({
      where: {
        user_id,
        task_id: tasks.map((task) => task.task_id),
      },
      attributes: ["submission_complete", "date", "file_path"],
      include: [
        {
          model: Task,
          attributes: ["title"],
        },
      ],
    });

    // Formatear las entregas para incluir el título de la tarea y URL pública del archivo
    const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
    const formattedSubmissions = submissions.map((submission) => {
      const normalizedPath = (submission.file_path || "").replace(/\\/g, "/");
      const publicFileUrl = normalizedPath
        ? encodeURI(`${BASE_URL}/${normalizedPath}`)
        : null;

      return {
        title: submission.Task.title,
        submission_complete: submission.submission_complete,
        date: submission.date,
        file_path: publicFileUrl,
      };
    });

    // Paso 7: Enviar la respuesta con los detalles del curso y las entregas del estudiante
    res.status(200).json({
      student: {
        name: student.name,
        email: student.email,
        carnet: student.carnet,
        sede: SedeInfo.nameSede,
        course: courseName,
      },
      formattedSubmissions,
    });
  } catch (error) {
    // Paso 8: Manejo de errores del servidor
    res.status(500).json({
      message: "Error al obtener la información del curso del estudiante",
      error: error.message || error,
    });
  }
};
/**
 * The function `getAllTasksBySedeYearAndUser` retrieves tasks and their submission status for a
 * specific user, year, and location.
 * @param req - The function `getAllTasksBySedeYearAndUser` is designed to handle a request and
 * retrieve tasks based on the provided parameters. Here's a breakdown of the parameters used in the
 * function:
 * @param res - The `res` parameter in the `getAllTasksBySedeYearAndUser` function is the response
 * object that will be used to send back the response to the client making the request. It is typically
 * used to send HTTP responses with data or error messages back to the client. In this function,
 * @returns The function `getAllTasksBySedeYearAndUser` returns a list of tasks along with their
 * submission status for a specific user, year, and location (sede). The tasks are fetched based on
 * course assignments for the given year and location, and then matched with task submissions of the
 * user to provide the submission status for each task. The final response includes the tasks with
 * their submission status.
 */

const getAllTasksBySedeYearAndUser = async (req, res) => {
  const { user_id, year, sede_id } = req.params;

  try {
    // Paso 1: Verificar si el usuario existe
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "El usuario no existe" });
    }

    // Paso 2: Verificar si el año existe
    const yearRecord = await Year.findOne({
      where: { year },
    });
    if (!yearRecord) {
      return res.status(404).json({ message: "El año no existe" });
    }
    const year_id = yearRecord.year_id;

    // Paso 3: Obtener todas las asignaciones de cursos para la sede y el año
    const courseSedeAssignments = await CourseSedeAssignment.findAll({
      where: { sede_id, year_id },
    });

    if (courseSedeAssignments.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron asignaciones de cursos para la sede y el año especificados",
      });
    }

    // Paso 4: Obtener todas las tareas de los cursos asignados
    const tasks = await Task.findAll({
      where: {
        asigCourse_id: courseSedeAssignments.map(
          (assignment) => assignment.asigCourse_id
        ),
      },
      attributes: [
        "task_id",
        "title",
        "description",
        "taskStart",
        "endTask",
        "startTime",
        "endTime",
      ],
    });

    if (tasks.length === 0) {
      return res.status(404).json({
        message: "No se encontraron tareas para los cursos asignados",
      });
    }

    // Paso 5: Obtener las entregas de tareas del usuario
    const submissions = await TaskSubmissions.findAll({
      where: { user_id },
      attributes: ["task_id", "submission_complete", "date"],
    });

    // Paso 6: Mapear las tareas con su estado de entrega
    const tasksWithSubmissionStatus = tasks.map((task) => {
      const submission = submissions.find(
        (sub) => sub.task_id === task.task_id
      );
      return {
        ...task.dataValues,
        submission_complete: submission ? submission.submission_complete : null,
        submission_date: submission ? submission.date : null,
      };
    });

    // Paso 7: Enviar la respuesta con las tareas y su estado de entrega
    res.status(200).json({
      tasks: tasksWithSubmissionStatus,
    });
  } catch (error) {
    // Paso 8: Manejo de errores del servidor
    res.status(500).json({
      message: "Error al obtener las tareas y su estado de entrega",
      error: error.message || error,
    });
  }
};

module.exports = {
  getCourseDetails,
  createTaskSubmission,
  getStudentCourseDetails,
  getAllTasksBySedeYearAndUser,
};
