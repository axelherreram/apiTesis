const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { logActivity } = require("../sql/appLog");
const CourseAssignment = require("../models/courseAssignment");
const path = require("path");
const fs = require("fs");
const Year = require("../models/year");


const registerUser = async (req, res) => {
  const {
    email,
    password,
    name,
    carnet,
    sede_id,
    rol_id,
    year,
  } = req.body;

  // Validación de campos requeridos
  if (!email || !password || !name || !carnet || !sede_id || !rol_id || !year) {
    return res.status(400).json({
      message: "Faltan campos requeridos. Por favor, proporcione todos los datos necesarios.",
    });
  }

  try {
    // Obtener el año actual
    const currentYear = new Date().getFullYear();

    // Verificar si el año proporcionado es mayor al año actual
    if (year > currentYear) {
      return res.status(400).json({
        message: `No se puede crear un año mayor al actual (${currentYear}).`,
      });
    }

    // Verificar que el año exista en la tabla Year o crearlo si no existe
    const [yearRecord] = await Year.findOrCreate({
      where: { year: year },
      defaults: { year: year }, // Crea el año si no existe
    });

    // Verificar si el usuario ya está registrado
    let user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(400).json({
        message: `Ya existe un usuario registrado con el correo electrónico ${email}.`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario con el year_id del año encontrado o creado
    user = await User.create({
      email,
      password: hashedPassword,
      name,
      carnet,
      sede_id,
      rol_id,
      year_id: yearRecord.year_id, // Asociar el year_id
    });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
    });
  } catch (err) {
    console.error("Error en el registro de usuario:", err);
    res.status(500).json({
      message: "Error en el servidor. Por favor, intente más tarde.",
      error: err.message,
    });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña inválida" });
    }

    const token = jwt.sign(
      {
        user: {
          user_id: user.user_id,
          rol_id: user.rol_id,
          sede_id: user.sede_id,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await logActivity(
      user.user_id,
      user.sede_id,
      user.name,
      `El usuario inició sesión`,
      "Inicio de sesión"
    );

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      id: user.user_id,
      sede: user.sede_id,
      rol: user.rol_id,
      passwordUpdate: user.passwordUpdate,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user_id = req.user ? req.user.user_id : null;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Se requieren la contraseña actual y la nueva contraseña",
    });
  }

  try {
    const user = await User.findOne({ where: { user_id } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await User.update({ password: hashedNewPassword, passwordUpdate: true }, { where: { user_id } });

    const updatedUser = await User.findOne({ where: { user_id } });

    await logActivity(
      user_id,
      updatedUser.sede_id,
      updatedUser.name,
      `El usuario actualizó su contraseña`,
      "Actualización de contraseña"
    );

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
};

const updateProfilePhoto = async (req, res) => {
  const user_id = req.user ? req.user.user_id : null;
  const profilePhoto = req.file ? req.file.filename : null;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!profilePhoto) {
    return res
      .status(400)
      .json({ message: "No se proporcionó una nueva foto de perfil" });
  }

  try {
    const user = await User.findOne({ where: { user_id } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.profilePhoto) {
      const oldImagePath = path.join(
        __dirname,
        "../public/fotoPerfil",
        user.profilePhoto
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.log(`Error al eliminar la foto anterior: ${err.message}`);
          } else {
            console.log("Foto de perfil anterior eliminada correctamente");
          }
        });
      }
    }

    await User.update({ profilePhoto: profilePhoto }, { where: { user_id } });

    const updatedUser = await User.findOne({ where: { user_id } });

    await logActivity(
      user_id,
      updatedUser.sede_id,
      updatedUser.name,
      `El usuario actualizó su foto de perfil`,
      "Actualización de foto de perfil"
    );

    res.json({ message: "Foto de perfil actualizada exitosamente" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updatePassword,
  updateProfilePhoto,
};
