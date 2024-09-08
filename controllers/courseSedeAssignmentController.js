const CourseSedeAssignment = require('../models/courseSedeAssignment');
const Course = require('../models/course');
const Sede = require('../models/sede');

const createSedeAssignment = async (req, res) => {
    const { course_id, sede_id } = req.body;

    try {

        const currentMonth = new Date().getMonth() + 1; // getMonth() 

        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({
                message: `No se encontró un curso con el ID ${course_id}.`,
            });
        }

        const course_name = course.courseName;

        if ((course_id === 1 && currentMonth > 6) || (course_id === 2 && currentMonth <= 6)) {
            return res.status(400).json({
                message: `El curso ${course_name} fuera del perido de asignación.`,
            });
        }
        
        // Verificar si la asignación ya existe
        const existingAssignment = await CourseSedeAssignment.findOne({
            where: {
                course_id,
                sede_id,
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

        // Crear una nueva asignación de curso y sede con courseActive en true
        const newSedeAssignment = await CourseSedeAssignment.create({
            course_id,
            sede_id,
            courseActive: true,
        });

        res.status(201).json({
            message: 'Asignación de curso a sede creada exitosamente.',
            data: newSedeAssignment,
        });
    } catch (error) {
        console.error('Error al crear la asignación de curso a sede:', error);
        res.status(500).json({
            message: 'Error en el servidor al crear la asignación.',
            error: error.message,
        });
    }
};


const getCoursesBySede = async (req, res) => {
    const { sede_id } = req.params; // Obtener el ID de la sede desde los parámetros de la ruta

    try {
        // Verificar si la sede existe
        const sede = await Sede.findByPk(sede_id);
        if (!sede) {
            return res.status(404).json({
                message: `No se encontró una sede con el ID ${sede_id}.`,
            });
        }

        // Buscar los cursos asignados a esa sede
        const assignments = await CourseSedeAssignment.findAll({
            where: { sede_id },
            include: [
                {
                    model: Course,
                    attributes: ['courseName'], // Obtener solo el nombre del curso
                },
            ],
        });

        if (assignments.length === 0) {
            return res.status(404).json({
                message: `No se encontraron cursos asignados a la sede ${sede.nameSede}.`,
            });
        }

        // Responder con los cursos asignados
        res.status(200).json({
            message: `Cursos asignados a la sede ${sede.nameSede} recuperados exitosamente.`,
            data: assignments,
        });
    } catch (error) {
        console.error('Error al recuperar los cursos asignados a la sede:', error);
        res.status(500).json({
            message: 'Error en el servidor al recuperar los cursos asignados a la sede.',
            error: error.message,
        });
    }
};

module.exports = {
    createSedeAssignment,
    getCoursesBySede
};