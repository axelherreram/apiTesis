const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuarios = require("../models/usuarios");
const { registrarBitacora } = require("../sql/bitacora");
const multer = require('multer');
const CursoAsignacion = require("../models/cursoAsignacion");
const path = require('path'); // Asegúrate de importar path aquí
const fs = require('fs');

// Configuración de multer para limitar los tipos de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/fotoPerfil'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filtro de archivos para aceptar solo PNG y JPG
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Acepta el archivo
  } else {
    cb(new Error('Solo se permiten archivos PNG y JPG'), false); // Rechaza el archivo
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const registerUser = async (req, res) => {
  const {
    email,
    password,
    nombre,
    carnet,
    sede_id,
    rol_id,
    anioRegistro,
    curso_id,
  } = req.body;

  try {
    let user = await Usuarios.findOne({ where: { email } });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await Usuarios.create({
        email,
        password: hashedPassword,
        nombre,
        carnet,
        sede_id,
        rol_id,
        anioRegistro,
      });

      if (!curso_id) {
        return res
          .status(201)
          .json({ message: "Usuario registrado exitosamente" });
      }
    }

    // Verificar si el usuario ya está asignado a este curso
    const asignacionExistente = await CursoAsignacion.findOne({
      where: {
        estudiante_id: user.user_id,
        curso_id: curso_id,
      },
    });

    if (asignacionExistente) {
      return res
        .status(400)
        .json({
          message: `El usuario ya está asignado al curso con ID ${curso_id}`,
        });
    }

    // Asignar el curso al usuario
    await CursoAsignacion.create({
      estudiante_id: user.user_id,
      curso_id: curso_id,
    });

    res
      .status(201)
      .json({ message: "Usuario registrado y curso asignado exitosamente" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Usuarios.findOne({ where: { email } });

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

    // Registrar en la bitácora
    registrarBitacora(
      user.user_id,
      user.nombre,
      "El usuario inició sesión",
      "Inicio de sesión"
    );

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      email: user.email,
      userName: user.nombre,
      carnet: user.carnet,
      sede: user.sede_id,
      rol: user.rol_id,
      anio: user.anioRegistro,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarPassword = async (req, res) => {
  const { password } = req.body;
  const user_id = req.user ? req.user.user_id : null;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!password) {
    return res
      .status(400)
      .json({ message: "Se requiere una nueva contraseña" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await Usuarios.update({ password: hashedPassword }, { where: { user_id } });

    const userUpdated = await Usuarios.findOne({ where: { user_id } });

    // Registrar la actualización en la bitácora
    await registrarBitacora(
      user_id,
      userUpdated.nombre,
      `El usuario actualizó su contraseña`,
      "Actualización de contraseña"
    );

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

const actualizarFotoPerfil = async (req, res) => {
  const user_id = req.user ? req.user.user_id : null;
  const fotoPerfil = req.file ? req.file.filename : null;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!fotoPerfil) {
    return res
      .status(400)
      .json({ message: "No se proporcionó una nueva foto de perfil" });
  }

  try {
    const user = await Usuarios.findOne({ where: { user_id } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.FotoPerfil) {
      const oldImagePath = path.join(__dirname, '../public/fotoPerfil', user.FotoPerfil);

      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.log(`Error al eliminar la foto anterior: ${err.message}`);
          } else {
            console.log('Foto de perfil anterior eliminada correctamente');
          }
        });
      } else {
        console.log('La foto de perfil anterior no existe');
      }
    }

    await Usuarios.update({ FotoPerfil: fotoPerfil }, { where: { user_id } });

    const userUpdated = await Usuarios.findOne({ where: { user_id } });

    await registrarBitacora(
      user_id,
      userUpdated.nombre,
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
  actualizarPassword,
  actualizarFotoPerfil,
  upload
};
