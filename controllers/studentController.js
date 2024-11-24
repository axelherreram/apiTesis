const xlsx = require("xlsx");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const CourseAssignment = require("../models/courseAssignment");
const path = require("path");
const fs = require("fs");
const Year = require("../models/year");
const { sendEmailPassword } = require("./emailController");
const CourseSedeAssignment = require("../models/courseSedeAssignment");

const bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Se requiere un archivo Excel" });
    }
    const filename = path.basename(req.file.originalname);
    const filePath = path.join(__dirname, "../public/uploads/excels", filename);

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const usersData = xlsx.utils.sheet_to_json(sheet);

    // Validación de campos en el archivo Excel
    if (!usersData.length) {
      return res.status(400).json({ message: "El archivo está vacío" });
    }

    // Definir los campos necesarios
    const requiredFields = ['email', 'nombre', 'carnet'];
    
    // Verificar si los campos requeridos están presentes en cada fila de datos
    for (const user of usersData) {
      const missingFields = requiredFields.filter(field => !user[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `El archivo de Excel está incompleto. Faltan los siguientes campos: ${missingFields.join(", ")}`
        });
      }
    }

    // Obtener el año actual
    const currentYear = new Date().getFullYear();

    // Buscar el año actual en la tabla Year, si no existe, crearlo
    const [yearRecord] = await Year.findOrCreate({
      where: { year: currentYear },
      defaults: { year: currentYear },
    });

    const year_id = yearRecord.year_id;

    const sede_id = req.body.sede_id;
    const rol_id = req.body.rol_id;
    const course_id = req.body.course_id;

    if (course_id) {
      // Buscar la asignación de curso, sede y año
      const sedeCourseAssignment = await CourseSedeAssignment.findOne({
        where: {
          sede_id,
          course_id,
          year_id,
        },
      });

      if (!sedeCourseAssignment) {
        return res.status(404).json({
          message: "No existe asignación de curso para la sede seleccionada",
        });
      }
    }

    for (const user of usersData) {
      const { email, nombre, carnet } = user;

      let existingUser = await User.findOne({ where: { email } });

      if (!existingUser) {
        const randomPassword = Math.random().toString(36).slice(-8);
        console.log(`Contraseña generada para ${email}: ${randomPassword}`);

        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Crear usuario con el year_id del año actual o recién creado
        existingUser = await User.create({
          email,
          password: hashedPassword,
          name: nombre,
          carnet,
          rol_id,
          sede_id,
          year_id,
        });

        // Enviar correo electrónico con la contraseña temporal
        const templateVariables = {
          nombre: nombre,
          password: randomPassword,
        };

        /* await sendEmailPassword('Registro exitoso', `Hola ${nombre}, tu contraseña temporal es: ${randomPassword}`, email, templateVariables); */
      }

      // Si el course_id está presente, hacer la asignación
      if (course_id) {
        // Buscar la asignación de curso, sede y año
        const sedeCourseAssignment = await CourseSedeAssignment.findOne({
          where: {
            sede_id,
            course_id,
            year_id,
          },
        });

        if (!sedeCourseAssignment) {
          return res.status(404).json({
            message: "No existe asignación de curso para la sede seleccionada",
          });
        }

        const asigCourse_id = sedeCourseAssignment.asigCourse_id;  // Obtener el ID de la asignación de curso

        // Verificar si ya existe la asignación del estudiante
        const existingAssignment = await CourseAssignment.findOne({
          where: {
            student_id: existingUser.user_id,
            asigCourse_id: asigCourse_id,  // Usar el ID de la asignación de curso
          },
        });

        if (!existingAssignment) {
          // Crear la asignación para el estudiante con el asigCourse_id
          await CourseAssignment.create({
            student_id: existingUser.user_id,
            asigCourse_id,  // Asociar con la asignación de curso, sede y año
            year_id,
          });
        }
      }
    }

    // Eliminar el archivo Excel después de completar la carga
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error al eliminar el archivo Excel: ${err.message}`);
      }
    });

    res.status(201).json({ message: "Usuarios cargados exitosamente" });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);

    // Eliminar el archivo Excel en caso de error
    if (req.file && filePath) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error al eliminar el archivo Excel: ${err.message}`);
        }
      });
    }

    res
      .status(500)
      .json({ message: "Error al cargar usuarios", error: error.message });
  }
};

module.exports = {
  bulkUploadUsers,
};
