const xlsx = require("xlsx");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
const Year = require("../models/year");
const { sendEmailCatedratico } = require("./emailController");

const bulkUploadCatedratico = async (req, res) => {
  const { sede_id: tokenSedeId } = req; // Extraer sede_id del token
  const { sede_id } = req.body; // Extraer el valor de sede_id del cuerpo de la solicitud

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Se requiere un archivo Excel" });
    }

    // Validar que el sede_id en la solicitud coincida con el sede_id del token
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res.status(403).json({ message: "No tienes acceso a esta sede" });
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
    const requiredFields = ["email", "nombre", "carnet"];

    // Verificar si los campos requeridos están presentes en cada fila de datos
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

    // Obtener el año actual
    const currentYear = new Date().getFullYear();

    // Buscar el año actual en la tabla Year, si no existe, crearlo
    const [yearRecord] = await Year.findOrCreate({
      where: { year: currentYear },
      defaults: { year: currentYear },
    });

    const year_id = yearRecord.year_id;

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
          rol_id: 2, // Rol de administrador
          sede_id,
          year_id,
        });

        // Enviar correo con las credenciales al profesor
        await sendEmailCatedratico("Bienvenido a TesM", email, {
          nombre: nombre,
          password: randomPassword,
        });
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
  bulkUploadCatedratico,
};
