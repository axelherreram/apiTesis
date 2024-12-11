const CourseSedeAssignment = require("../models/courseSedeAssignment");
const Course = require("../models/course");
const Sede = require("../models/sede");
const Year = require("../models/year");

const createSedeAssignment = async (req, res) => {
  const { course_id, sede_id } = req.body;

  try {
    // Obtener el año actual
    const currentYear = new Date().getFullYear();

    // Buscar el año actual en la tabla Year, si no existe, crearlo
    const [yearRecord] = await Year.findOrCreate({
      where: { year: currentYear },
      defaults: { year: currentYear },
    });

    const year_id = yearRecord.year_id;

    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({
        message: `No se encontró un curso con el ID ${course_id}.`,
      });
    }

    const course_name = course.courseName;

    // Verificar si la asignación ya existe en el año actual
    const existingAssignment = await CourseSedeAssignment.findOne({
      where: {
        course_id,
        sede_id,
        year_id,
      },
    });

    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res.status(404).json({
        message: `No se encontró una sede con el ID ${sede_id}.`,
      });
    }

    const sedeName = sede.nameSede;
    if (existingAssignment) {
      return res.status(400).json({
        message: `La asignación del curso ${course_name} a la sede ${sedeName} ya existe.`,
      });
    }

    // Desactivar el curso anterior si se asigna PG2
    if (course_id === 2) {
      // PG2 tiene course_id = 2
      await CourseSedeAssignment.update(
        { courseActive: false },
        {
          where: {
            course_id: 1, // PG1 tiene course_id = 1
            sede_id,
            year_id,
          },
        }
      );
    }

    // Desactivar PG2 del año anterior si se asigna PG1 en el año actual
    if (course_id === 1) { // Suponiendo que PG1 tiene course_id = 1
      const previousYear = currentYear - 1;
      const previousYearRecord = await Year.findOne({
        where: { year: previousYear },
      });

      if (previousYearRecord) {
        const previousYear_id = previousYearRecord.year_id;
        await CourseSedeAssignment.update(
          { courseActive: false },
          {
            where: {
              course_id: 2, // PG2 tiene course_id = 2
              sede_id,
              year_id: previousYear_id,
            },
          }
        );
      }
    }

    // Crear una nueva asignación de curso y sede con courseActive en true
    await CourseSedeAssignment.create({
      course_id,
      sede_id,
      year_id,
      courseActive: true,
    });

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

const getCoursesBySede = async (req, res) => {
  const { sede_id } = req.params;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    // Verificar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a los cursos de esta sede" });
    }

    // Obtener el año actual
    const currentYear = new Date().getFullYear();

    // Buscar el año actual en la tabla Year
    const yearRecord = await Year.findOne({
      where: { year: currentYear },
    });

    // Si no se encuentra el año, devolver un error
    if (!yearRecord) {
      return res.status(404).json({
        message: `No se encontró un registro para el año ${currentYear}.`,
      });
    }

    const year_id = yearRecord.year_id;

    // Verificar si la sede existe
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res.status(404).json({
        message: `No se encontró una sede con el ID ${sede_id}.`,
      });
    }

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

    // Si no se encontraron asignaciones, devolver una lista vacía
    if (assignments.length === 0) {
      return res.status(200).json({
        message: `No se encontraron cursos asignados a la sede ${sede.nameSede} para el año ${currentYear}.`,
        data: [],
      });
    }

    // Mapear los resultados para devolver solo los datos del curso
    const courses = assignments.map((assignment) => assignment.Course);

    // Responder con los cursos asignados
    res.status(200).json({
      message: `Cursos asignados a la sede ${sede.nameSede} para el año ${currentYear} recuperados exitosamente.`,
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
