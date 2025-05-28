const CourseSedeAssignment = require("../models/courseSedeAssignment");
const User = require("../models/user");
const Task = require("../models/task");
const TaskSubmissions = require("../models/taskSubmissions");
const Year = require("../models/year");
const CourseAssignment = require("../models/courseAssignment");
const Course = require("../models/course");
const ApprovalThesis = require("../models/approvalThesis");
const RevisionThesis = require("../models/revisionThesis");

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
  const { sede_id: tokenSedeId, rol_id } = req;

  try {
    // Validar que el `sede_id` del token coincida con el `sede_id` de la solicitud, salvo para roles 4 y 5
    if (rol_id !== 4 && rol_id !== 5) {
      if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
        return res
          .status(403)
          .json({ message: "No tienes acceso a los grupos de esta sede" });
      }
    }

    // Total de revisiones aprobadas para la sede específica
    const totalApprovedRevisions = await ApprovalThesis.count({
      where: {
        status: "approved",
      },
      include: [{
        model: RevisionThesis,
        where: { sede_id: sede_id }
      }]
    });

    const totalInRevisions = await ApprovalThesis.count({
      where: {
        status: "in revision",
      },
      include: [{
        model: RevisionThesis,
        where: { sede_id: sede_id }
      }]
    });

    // Total de estudiantes en la sede específica
    const totalStudentsSede = await User.count({
      where: { 
        rol_id: 1, 
        sede_id: sede_id 
      },
    });

    // Total de estudiantes en todas las sedes
    const totalStudents = await User.count({ 
      where: { rol_id: 1 } 
    });

    res.status(200).json({
      totalStudents,
      totalStudentsSede,
      totalApprovedRevisions,
      totalInRevisions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los datos gráficos",
      error: error.message,
    });
  }
};

/**
 * The function `getTaskSubmissionStats` retrieves and calculates statistics on task submissions for a
 * specific course, year, and location.
 *
 * @param req - The `req` parameter is the request object containing parameters such as `course_id`,
 * `year`, and `sede_id`, which are used to fetch the corresponding data.
 * @param res - The `res` parameter is the response object, used to send the result of the function back to
 * the client. It will contain a JSON response with task submission statistics or error messages.
 *
 * @returns A JSON object with the total number of students in the course and detailed statistics for each task.
 * This includes the number of confirmed submissions and pending submissions for each task.
 * In case of an error, a 500 status with an error message will be returned.
 */
const getTaskSubmissionStatsAdvanced = async (req, res) => {
  const { sede_id } = req.params;

  try {
    // Obtener el año y mes actual
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Enero es 0, por eso sumamos 1

    // Determinar el course_id según el mes actual
    const course_id = currentMonth <= 6 ? 1 : 2;

    // Buscar el año en la base de datos
    const yearRecord = await Year.findOne({
      where: { year: currentYear },
    });

    if (!yearRecord) {
      return res
        .status(404)
        .json({ message: "No se encontró el año actual en la base de datos." });
    }

    const year_id = yearRecord.year_id;

    // Obtener la asignación de cursos según la sede y el año
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { sede_id, year_id, course_id },
    });

    if (!courseSedeAssignment) {
      return res
        .status(404)
        .json({
          message: "No hay cursos asignados para este mes en la sede actual.",
        });
    }

    // Obtener las tareas del curso asignado
    const tasks = await Task.findAll({
      where: { asigCourse_id: courseSedeAssignment.asigCourse_id },
      attributes: ["task_id", "title"],
    });

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay tareas registradas para este curso." });
    }

    let totalSubmissions = 0;
    let completedSubmissions = 0;
    let pendingSubmissions = 0;
    let submissionCounts = [];

    // Obtener estadísticas de todas las tareas en paralelo con Promise.all
    const taskStats = await Promise.all(
      tasks.map(async (task) => {
        const task_id = task.task_id;

        // Contar total de entregas
        const total = await TaskSubmissions.count({ where: { task_id } });

        // Contar entregas completas
        const completed = await TaskSubmissions.count({
          where: { task_id, submission_complete: true },
        });

        const pending = total - completed; // Entregas pendientes

        totalSubmissions += total;
        completedSubmissions += completed;
        pendingSubmissions += pending;

        return {
          task_id,
          title: task.title,
          totalSubmissions: total,
        };
      })
    );

    // Calcular promedio de entregas por tarea
    const avgSubmissions = totalSubmissions / tasks.length || 0;

    // Ordenar tareas por cantidad de entregas
    taskStats.sort((a, b) => a.totalSubmissions - b.totalSubmissions);

    // Calcular porcentajes de entregas completas vs. incompletas
    const totalTasksSubmissions = completedSubmissions + pendingSubmissions;
    const completedPercentage =
      totalTasksSubmissions > 0
        ? ((completedSubmissions / totalTasksSubmissions) * 100).toFixed(2)
        : "0.00";

    const pendingPercentage =
      totalTasksSubmissions > 0
        ? ((pendingSubmissions / totalTasksSubmissions) * 100).toFixed(2)
        : "0.00";

    res.status(200).json({
      course_id,
      avgSubmissionsPerTask: avgSubmissions.toFixed(2),
      totalSubmissions,
      completedSubmissions,
      pendingSubmissions,
      completionRate: `${completedPercentage}%`,
      pendingRate: `${pendingPercentage}%`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener estadísticas avanzadas de entregas",
      error: error.message,
    });
  }
};

module.exports = {
  dataGraphics,
  getTaskSubmissionStats,
  getTaskSubmissionStatsAdvanced,
};
