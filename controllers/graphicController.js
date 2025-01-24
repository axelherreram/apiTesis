const CourseSedeAssignment = require("../models/courseSedeAssignment");
const User = require("../models/user");
const Task = require("../models/task");
const TaskSubmissions = require("../models/taskSubmissions");
const Year = require("../models/year");
const CourseAssignment = require("../models/courseAssignment");

/**
 * The function `getTaskSubmissionStats` retrieves and calculates statistics on task submissions for a
 * specific course, year, and location.
 * @param req - The code snippet you provided is an asynchronous function `getTaskSubmissionStats` that
 * retrieves statistics about task submissions based on the parameters `course_id`, `year`, and
 * `sede_id` from the request object `req`.
 * @param res - The `res` parameter in the `getTaskSubmissionStats` function is the response object
 * that will be used to send the response back to the client making the request. It is typically an
 * instance of the Express response object in Node.js applications. The response object allows you to
 * send HTTP responses with data
 * @returns The function `getTaskSubmissionStats` returns a JSON response containing the statistics of
 * task submissions for a specific course, year, and location. The response includes the total number
 * of students assigned to the course and detailed statistics for each task, such as the number of
 * pending students and confirmed submissions. If there are any errors during the process, a 500 status
 * response with an error message is returned.
 */
const getTaskSubmissionStats = async (req, res) => {
  const { course_id, year, sede_id } = req.params;

  try {
    // Paso 1: Verificar si el año existe
    const yearRecord = await Year.findOne({
      where: { year },
    });
    if (!yearRecord) {
      return res.status(404).json({ message: "El año no existe" });
    }
    const year_id = yearRecord.year_id;

    // Paso 2: Validar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
    });
    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede",
      });
    }
    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Paso 3: Obtener todas las tareas del curso
    const tasks = await Task.findAll({
      where: { asigCourse_id },
      attributes: ["task_id", "typeTask_id"],
    });

    // Paso 4: Obtener todos los estudiantes asignados al curso
    const students = await User.findAll({
      where: { rol_id: 1, sede_id },
      include: [
        {
          model: CourseAssignment,
          where: { asigCourse_id },
        },
      ],
      attributes: ["user_id"],
    });

    const totalStudents = students.length;

    // Paso 5: Obtener las entregas de tareas de los estudiantes
    const taskStats = await Promise.all(
      tasks.map(async (task, index) => {
        if (task.typeTask_id === 1) {
          return null; // No incluir estadísticas para tareas con typeTask_id === 1
        }

        const submissions = await TaskSubmissions.findAll({
          where: { task_id: task.task_id, submission_complete: true },
          attributes: ["user_id"],
        });

        const submittedStudents = submissions.length;
        const notSubmittedStudents = totalStudents - submittedStudents;

        return {
          task: index + 1, // Número de tarea basado en el índice
          pendingStudents: notSubmittedStudents,
          confirmedStudents: submittedStudents,
        };
      })
    );

    // Filtrar las tareas que son null
    const filteredTaskStats = taskStats.filter((task) => task !== null);

    // Paso 6: Enviar la respuesta con las estadísticas de las tareas
    res.status(200).json([{ totalStudents }, ...filteredTaskStats]);
  } catch (error) {
    // Paso 7: Manejo de errores del servidor
    res.status(500).json({
      message: "Error al obtener las estadísticas de las tareas",
      error: error.message || error,
    });
  }
};

/**
 * The function `dataGraphics` retrieves and returns total student counts based on the provided
 * `sede_id` and token validation.
 * @param req - The `req` parameter in the `dataGraphics` function represents the request object in
 * Node.js. It contains information about the HTTP request made to the server, including parameters,
 * headers, and body data. In this specific function, `req` is used to extract the `sede_id` parameter
 * @param res - The code snippet you provided is an asynchronous function `dataGraphics` that handles a
 * request and response in a Node.js environment. It retrieves the `sede_id` parameter from the request
 * and compares it with the `sede_id` stored in the token. If they do not match, it returns
 * @returns If the `sede_id` from the token matches the `sede_id` from the request, the function will
 * return a JSON response with the `totalStudents` and `totalStudentsSede` data. If the `sede_id`
 * values do not match, a 403 status with a message indicating lack of access will be returned. In case
 * of any errors during the process, a
 */
const dataGraphics = async (req, res) => {
  const { sede_id } = req.params;
  const { sede_id: tokenSedeId } = req;

  try {
    // Validar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a los grupos de esta sede" });
    }

    const totalStudents = await User.count({ where: { rol_id: 1 } });
    const totalStudentsSede = await User.count({
      where: { rol_id: 1, sede_id },
    });
    // const totalStudentsClosedGlobal = await User.count({where: { rol_id: 1, closedPlan: 1 }});
    // const totalStudentsClosed = await User.count({where: { rol_id: 1, sede_id, closedPlan: 1 }});

    res.status(200).json({
      totalStudents,
      totalStudentsSede,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los datos gráficos",
      error: error.message,
    });
  }
};

module.exports = {
  dataGraphics,
  getTaskSubmissionStats,
};
