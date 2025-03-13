const CourseSedeAssignment = require("../models/courseSedeAssignment");
const Course = require("../models/course");
const Sede = require("../models/sede");
const Year = require("../models/year");
const User = require("../models/user");
const { sendEmailActiveCouser } = require("../services/emailService");
const moment = require("moment");

/**
 * The function `createSedeAssignment` handles the creation of course assignments to different
 * locations based on certain conditions and error handling.
 * @param req - The function `createSedeAssignment` is an asynchronous function that handles the
 * creation of a course assignment to a specific location (sede). It takes two parameters `req` and
 * `res`, where `req` represents the request object containing data sent to the server, and `res`
 * represents the
 * @param res - The `res` parameter in the `createSedeAssignment` function is the response object that
 * will be used to send back the response to the client making the request. It is typically used to set
 * the status code of the response (e.g., 200 for success, 400 for bad request
 * @returns The function `createSedeAssignment` returns a JSON response with a success message if the
 * course assignment to a location is created successfully. If there are any validation errors or
 * exceptions during the process, it returns an appropriate error response with a relevant message.
 */
const createSedeAssignment = async (req, res) => {
  const { course_id } = req.body;
  const { sede_id, user_id } = req;

  try {

    const user = await User.findByPk(user_id);

    if(user.sede_id !== sede_id){
      return res.status(403).json({
        message: `No tienes permisos para asignar cursos a esta sede.`
      });
    }

    // Obtener el año y mes actual
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Validar que PG1 solo se pueda asignar en los primeros 6 meses y PG2 en los otros 6 meses
    if (
      (course_id === 1 && currentMonth > 6) ||
      (course_id === 2 && currentMonth <= 6)
    ) {
      return res.status(400).json({
        message:
          course_id === 1
            ? "PG1 solo se puede asignar en los primeros 6 meses del año."
            : "PG2 solo se puede asignar en los últimos 6 meses del año.",
      });
    }

    // Obtener el año actual y la sede de manera más eficiente
    const [yearRecord, course, sede] = await Promise.all([
      Year.findOrCreate({
        where: { year: currentYear },
        defaults: { year: currentYear },
      }),
      Course.findByPk(course_id),
      Sede.findByPk(sede_id),
    ]);

    if (!course)
      return res.status(404).json({ message: `No se encontró un curso.` });
    if (!sede)
      return res.status(404).json({ message: `No se encontró una sede` });

    const year_id = yearRecord[0].year_id;
    const course_name = course.courseName;
    const sedeName = sede.nameSede;

    // Verificar si ya existe una asignación para el curso en la sede y año actual
    const existingAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, sede_id, year_id },
    });
    if (existingAssignment) {
      return res.status(400).json({
        message: `La asignación del curso ${course_name} a la sede ${sedeName} ya existe.`,
      });
    }

    // Desactivar el curso anterior si es necesario
    if (course_id === 2) {
      await CourseSedeAssignment.update(
        { courseActive: false },
        { where: { course_id: 1, sede_id, year_id } }
      );
    }

    if (course_id === 1) {
      const previousYear = currentYear - 1;
      const previousYearRecord = await Year.findOne({
        where: { year: previousYear },
      });

      if (previousYearRecord) {
        const previousYear_id = previousYearRecord.year_id;
        await CourseSedeAssignment.update(
          { courseActive: false },
          { where: { course_id: 2, sede_id, year_id: previousYear_id } }
        );
      }
    }

    // Crear nueva asignación de curso y sede con courseActive en true
    await CourseSedeAssignment.create({
      course_id,
      sede_id,
      year_id,
      courseActive: true,
    });

    // Obtener el correo del administrador de la sede
    const adminUser = await User.findOne({
      where: { sede_id, rol_id: 3 },
      attributes: ["email"],
    });

    if (adminUser?.email) {
      const templateVariables = {
        name_sede: sedeName,
        course_name: course_name,
        date_assing: moment().format("YYYY-MM-DD"),
      };

      // Enviar correo al administrador de la sede
      await sendEmailActiveCouser(
        "Nuevo curso asignado a la sede",
        adminUser.email,
        templateVariables
      );
    } else {
      console.warn(
        `No se encontró un administrador para la sede con ID ${sede_id}`
      );
    }

    // Respuesta exitosa
    res.status(201).json({
      message: "Asignación de curso a sede creada exitosamente.",
    });
  } catch (error) {
    console.error("Error al crear la asignación de curso a sede:", error);
    res.status(500).json({
      message: "Error en el servidor al crear la asignación.",
      error: error.message,
    });
  }
};

/**
 * The function `getCoursesBySede` retrieves courses assigned to a specific location and year, handling
 * errors and returning the course data accordingly.
 * @param req - The `req` parameter in the `getCoursesBySede` function stands for the request object,
 * which contains information about the HTTP request made to the server. It includes data such as
 * request parameters, headers, body, and more. In this function, `req` is used to extract the
 * @param res - The function `getCoursesBySede` is an asynchronous function that retrieves courses
 * assigned to a specific location (sede) and year. It takes `req` and `res` as parameters, where `req`
 * contains information about the request being made, and `res` is used to send
 * @returns The `getCoursesBySede` function returns a list of courses assigned to a specific location
 * (sede) and year. If successful, it returns a JSON response with the data of the courses. If there
 * are no courses assigned to the specified location and year, it returns a message indicating that no
 * courses were found. If there are any errors during the process, it returns a 500 status
 */
const getCoursesBySede = async (req, res) => {
  const { sede_id, year } = req.params;
  const { sede_id: tokenSedeId, user_id } = req; // Sede extraída del token

  try {
    // Buscar el usuario y la sede de manera eficiente
    const [user, sede] = await Promise.all([
      User.findByPk(user_id),
      Sede.findByPk(sede_id),
    ]);

    if (!user) {
      return res.status(404).json({
        message: `No se encontró un usuario con el ID ${user_id}.`,
      });
    }

    if (!sede) {
      return res.status(404).json({
        message: `No se encontró una sede con el ID ${sede_id}.`,
      });
    }

    /*     // Verificar que la sede en el token coincida con la sede solicitada (si es necesario)
    if (tokenSedeId !== sede_id) {
      return res.status(403).json({
        message: `No tienes permisos para acceder a los cursos de esta sede.`,
      });
    }
 */
    // Buscar el año en la base de datos
    const yearRecord = await Year.findOne({
      where: { year: year },
    });

    if (!yearRecord) {
      return res.status(404).json({
        message: `No se encontró un registro para el año ${year}.`,
      });
    }

    const year_id = yearRecord.year_id;

    // Buscar los cursos asignados a esa sede y año
    const assignments = await CourseSedeAssignment.findAll({
      where: { sede_id, year_id },
      include: [
        {
          model: Course,
          attributes: ["course_id", "courseName"],
        },
      ],
    });

    // Si no se encuentran asignaciones, devolver una lista vacía
    if (assignments.length === 0) {
      return res.status(200).json({
        message: `No se encontraron cursos asignados a la sede ${sede.nameSede} para el año ${year}.`,
        data: [],
      });
    }

    // Mapear los resultados para devolver solo los datos del curso
    const courses = assignments.map((assignment) => assignment.Course);

    // Responder con los cursos asignados
    res.status(200).json({
      data: courses,
    });
  } catch (error) {
    console.error("Error al recuperar los cursos asignados a la sede:", error);
    res.status(500).json({
      message:
        "Error en el servidor al recuperar los cursos asignados a la sede.",
      error: error.message,
    });
  }
};

module.exports = {
  createSedeAssignment,
  getCoursesBySede,
};
