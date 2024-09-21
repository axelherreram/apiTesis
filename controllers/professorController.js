const User = require("../models/user");
const Year = require("../models/year");
const { logActivity } = require("../sql/appLog");
const bcrypt = require("bcrypt"); // Asegúrate de tener bcrypt para manejar el hashing de contraseñas

const createProfessor = async (req, res) => {
  const { email, name, carnet, sede_id, year } = req.body;
  const user_id = req.user_id;

  try {
    const currentYear = new Date().getFullYear();

    // Verificar si el año proporcionado es mayor al año actual
    if (year > currentYear) {
      return res.status(400).json({
        message: `No se puede crear un año mayor al actual (${currentYear}).`,
      });
    }

    // Validar que el correo tenga el dominio @miumg.edu.gt
    const emailDomain = "@miumg.edu.gt";
    if (!email.endsWith(emailDomain)) {
      return res.status(400).json({
        message: `El correo debe pertenecer al dominio ${emailDomain}`,
      });
    }

    // Verificar que el año exista en la tabla Year o crearlo si no existe
    const [yearRecord] = await Year.findOrCreate({
      where: { year: year },
      defaults: { year: year }, // Crea el año si no existe
    });
    // Obtener el usuario del token
    const userTokem = await User.findByPk(user_id);

    // Verificar si el usuario con el email ya existe
    const userExist = await User.findOne({
      where: {
        email,
      },
    });

    // Si el usuario ya existe, devolver un error
    if (userExist) {
      return res.status(400).json({
        message: `El usuario con el correo ${email} ya está registrado.`,
      });
    }

    // Generar una contraseña aleatoria
    const randomPassword = Math.random().toString(36).slice(-8);
    console.log(`Contraseña generada para ${email}: ${randomPassword}`);

    // Hashear la contraseña generada
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Crear el nuevo usuario (catedrático)
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      carnet,
      sede_id,
      rol_id: 2, // Rol de catedrático
      year_id: yearRecord.year_id,
    });

    // Registrar la actividad en los logs
    await logActivity(
      userTokem.user_id,
      userTokem.sede_id,
      userTokem.name,
      "Catedrático creado",
      `Creación de catedrático: ${user.name}`
    );

    // Responder con éxito
    res.status(201).json({
      message: "Catedrático creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear el catedrático:", error);
    res.status(500).json({
      message: "Error en el servidor al crear el catedrático",
      error: error.message,
    });
  }
};

module.exports = {
  createProfessor,
};
