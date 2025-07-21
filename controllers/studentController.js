const xlsx = require("xlsx");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const CourseAssignment = require("../models/courseAssignment");
const path = require("path");
const fs = require("fs");
const Year = require("../models/year");
const { sendEmailPassword } = require("../services/emailService");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const Course = require("../models/course");
const crypto = require("crypto");

/**
 * The function `bulkUploadUsers` handles the bulk upload of users, validates the uploaded Excel file,
 * processes user data, and assigns students to a course.
 * @param req - The `req` parameter in the `bulkUploadUsers` function represents the request object in
 * Node.js. It contains information about the HTTP request made to the server, including headers, body,
 * parameters, and more. In this function, `req` is used to extract data such as `sede
 * @param res - The function `bulkUploadUsers` is an asynchronous function that handles the bulk upload
 * of users. It takes two parameters, `req` and `res`, which represent the request and response
 * objects, respectively. The function processes the request to upload user data from an Excel file,
 * validates the data, creates
 * @returns The function `bulkUploadUsers` returns JSON responses based on different conditions during
 * the bulk upload process of users from an Excel file. Here are the possible return scenarios:
 */
const bulkUploadUsers = async (req, res) => {
  const { sede_id: tokenSedeId } = req; // Extraer sede_id del token
  const { sede_id, course_id } = req.body; // Extraer los valores de sede_id y course_id del cuerpo de la solicitud

  // Definir filePath fuera del bloque try
  let filePath;
  let alreadyAssignedCount = 0;

  try {
    // Paso 1: Validar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({ message: "Se requiere un archivo Excel" });
    }

    // Paso 2: Validar que el sede_id en la solicitud coincida con el sede_id del token
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res.status(403).json({ message: "No tienes acceso a esta sede" });
    }

    if (!course_id) {
      return res
        .status(400)
        .json({ message: "El campo course_id es obligatorio" });
    }

    const filename = path.basename(req.file.originalname);
    filePath = path.join(__dirname, "../public/uploads/excels", filename);

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const usersData = xlsx.utils.sheet_to_json(sheet);

    if (!usersData.length) {
      throw new Error("El archivo está vacío");
    }

    // Obtener el nombre del curso
    const course = await Course.findOne({
      where: { course_id },
      attributes: ["courseName"], // Asegúrate de que este campo sea correcto
    });

    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    const courseName = course.courseName;

    // Paso 6: Definir los campos necesarios y verificar si están presentes en cada fila de datos
    const requiredFields = ["email", "nombre", "carnet"];
    for (const user of usersData) {
      const missingFields = requiredFields.filter((field) => !user[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `El archivo de Excel está incompleto. Faltan los siguientes campos: ${missingFields.join(
            ", "
          )}`,
        });
      }
    }

    // Paso 7: Obtener el año actual
    const currentYear = new Date().getFullYear();
    //
    // Paso 8: Buscar el año actual en la tabla Year, si no existe, crearlo
    const [yearRecord] = await Year.findOrCreate({
      where: { year: currentYear },
      defaults: { year: currentYear },
    });

    const year_id = yearRecord.year_id;

    // Paso 9: Buscar la asignación de curso, sede y año
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

    if (!sedeCourseAssignment.courseActive) {
      return res.status(400).json({
        message: "El curso no se encuentra activo para la sede seleccionada",
      });
    }

    const asigCourse_id = sedeCourseAssignment.asigCourse_id; // Obtener el ID de la asignación de curso

    // Paso 10: Procesar cada usuario en el archivo Excel
    for (const user of usersData) {
      const { email, nombre, carnet } = user;

      // Convertir el nombre a mayúsculas
      const carnetLimpio = user.carnet.replace(/\s+/g, ""); // Elimina espacios del carnet
      // Paso 11: Verificar si el usuario ya existe
      let existingUser = await User.findOne({ where: { email } });

      if (!existingUser) {
        // Paso 12: Generar una contraseña temporal y hashearla
        const randomPassword = crypto
          .randomBytes(8)
          .toString("base64")
          .slice(0, 12);

        console.log(`Contraseña generada para ${email}: ${randomPassword}`);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Paso 13: Crear el usuario con el year_id del año actual o recién creado
        existingUser = await User.create({
          email,
          password: hashedPassword,
          name: nombre,
          carnet: carnetLimpio,
          rol_id: 1, // Rol de estudiante
          sede_id,
          year_id,
        });

        // Paso 14: Enviar correo electrónico con la contraseña temporal
        const templateVariables = {
          nombre: nombre,
          password: randomPassword,
        };

        await sendEmailPassword("Registro exitoso", email, templateVariables);
      }

      // Paso 15: Verificar si el usuario ya está asignado al curso actual
      const existingAssignmentForCourse = await CourseAssignment.findOne({
        where: {
          student_id: existingUser.user_id,
          asigCourse_id, // Asegura que la asignación sea específica por sede y curso
        },
      });

      if (existingAssignmentForCourse) {
        alreadyAssignedCount++;
        continue;
      }

      // Paso 16: Crear la asignación para el estudiante con el asigCourse_id
      const existingAssignment = await CourseAssignment.findOne({
        where: {
          student_id: existingUser.user_id,
          asigCourse_id,
        },
      });

      if (!existingAssignment) {
        await CourseAssignment.create({
          student_id: existingUser.user_id,
          asigCourse_id,
        });
      }
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error al eliminar el archivo Excel: ${err.message}`);
      }
    });

    if (alreadyAssignedCount === usersData.length) {
      return res.status(200).json({
        message:
          "Todos los estudiantes del archivo ya estaban asignados al curso.",
      });
    }

    res
      .status(201)
      .json({ message: `Estudiantes asignados exitosamente a ${courseName}` });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);

    if (filePath && fs.existsSync(filePath)) {
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
