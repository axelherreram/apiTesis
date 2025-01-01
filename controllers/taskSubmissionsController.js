const TaskSubmission = require("../models/taskSubmissions");
const Task = require("../models/task");
const User = require("../models/user");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const TaskSubmissions = require("../models/taskSubmissions");
const CourseAssignment = require("../models/courseAssignment");
const Year = require("../models/year");
const { addTimeline } = require("../sql/timeline");
const Sede = require("../models/sede");

const createTaskSubmission = async (req, res) => {
  const { user_id, task_id } = req.body;

  try {
    const userExist = await User.findByPk(user_id);
    if (!userExist) {
      return res.status(404).json({ message: "El usuario no existe" });
    }

    const taskExist = await Task.findByPk(task_id);
    if (!taskExist) {
      return res.status(404).json({ message: "La tarea no existe" });
    }

    // Verificar si ya existe una entrega
    const taskSubmissionExist = await TaskSubmission.findOne({
      where: { user_id, task_id },
    });

    if (taskSubmissionExist) {
      await taskSubmissionExist.update({
        submission_complete: true,
        date: new Date(),
      });

      await addTimeline(
        userExist.user_id,
        "Tarea de envío actualizada",
        `Confirmación de entrega para la tarea`,
        taskExist.task_id
      );

      return res.status(200).json({
        message: "Tarea de envío actualizada exitosamente",
      });
    }

    // Crear nueva entrega
    await TaskSubmission.create({
      user_id,
      task_id,
      submission_complete: true,
      date: new Date(),
    });

    res.status(201).json({
      message: "Tarea de envío creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear la tarea de envío:", error);
    res.status(500).json({
      message: "Error en el servidor al crear la tarea de envío",
      error: error.message,
    });
  }
};

const getCourseDetails = async (req, res) => {
  const { course_id, sede_id, year } = req.params;

  try {
    const yearRecord = await Year.findOne({
      where: { year },
    });

    const year_id = yearRecord.year_id;

    // Paso 1: Validar la asignación del curso y sede
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede",
      });
    }

    const asigCourse_id = courseSedeAssignment.asigCourse_id;

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
        });

        return {
          student,
          submissions,
        };
      })
    );

    // Paso 5: Enviar la respuesta con los detalles del curso
    res.status(200).json({
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
    });
    if (!courseSedeAssignment) {
      return res.status(404).json({
        message: "No se encontró una asignación válida de curso y sede",
      });
    }
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
      attributes: [ "submission_complete", "date"],
      include: [
        {
          model: Task,
          attributes: ["title"], 
        },
      ],
    });
    
    // Formatear las entregas para incluir el título de la tarea
    const formattedSubmissions = submissions.map((submission) => ({
      title: submission.Task.title, 
      submission_complete: submission.submission_complete,
      date: submission.date,
    }));

    // Paso 7: Enviar la respuesta con los detalles del curso y las entregas del estudiante
    res.status(200).json({
      student: {
        name: student.name,
        email: student.email,
        carnet: student.carnet,
        sede: SedeInfo.nameSede,

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
