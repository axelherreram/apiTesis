const Usuarios = require("../models/usuarios");
const { registrarBitacora } = require("../sql/bitacora");

const actualizarActivoTerna = async (req, res) => {
  const { activoTerna } = req.body;
  const { user_id } = req.params;

  try {
    const usuario = await Usuarios.findOne({ where: { user_id } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await Usuarios.update({ activoTerna }, { where: { user_id } });

    await registrarBitacora(
      user_id,
      usuario.sede_id,
      usuario.nombre,
      `El campo activoTerna ha sido actualizado a ${activoTerna}`,
      "Actualización de campo activoTerna"
    );

    res.status(200).json({
      message: "Campo activoTerna actualizado exitosamente",
      data: { user_id, activoTerna },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al actualizar el campo activoTerna",
      error: error.message,
    });
  }
};

const listarternas = async (req, res) => {
  try {
    const { sede_id } = req.query;

    if (!sede_id) {
      return res.status(400).json({ message: "El parámetro sede_id es obligatorio" });
    }

    const users = await Usuarios.findAll({
      where: {
        rol_id: 2,
        sede_id: sede_id 
      },
      attributes: ["user_id", "email", "nombre", "FotoPerfil", "activoTerna"], 
    });

    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      userName: user.nombre,
      fotoPerfil: user.FotoPerfil ? `http://localhost:3000/public/fotoPerfil/${user.FotoPerfil}` : null, 
      activoTerna: user.activoTerna,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

const listarTernasActivos = async (req, res) => {
  try {
    const { sede_id } = req.query;

    if (!sede_id) {
      return res.status(400).json({ message: "El parámetro sede_id es obligatorio" });
    }

    const users = await Usuarios.findAll({
      where: {
        rol_id: 2,
        activoTerna: true,
        sede_id: sede_id 
      },
      attributes: ["user_id", "email", "nombre", "FotoPerfil", "activoTerna"], 
    });

    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      userName: user.nombre,
      fotoPerfil: user.FotoPerfil ? `http://localhost:3000/public/fotoPerfil/${user.FotoPerfil}` : null, 
      activoTerna: user.activoTerna,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};
module.exports = {
  listarternas,
  listarTernasActivos,
  actualizarActivoTerna,
};
