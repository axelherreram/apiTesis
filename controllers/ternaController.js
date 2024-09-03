const User = require("../models/user");
const { logActivity } = require("../sql/appLog");

// const updateTernaStatus = async (req, res) => {
//   const { activoTerna } = req.body;
//   const { user_id } = req.params;

//   try {
//     const user = await User.findOne({ where: { user_id } });

//     if (!user) {
//       return res.status(404).json({ message: "Usuario no encontrado" });
//     }

//     await User.update({ activoTerna }, { where: { user_id } });

//     await logActivity(
//       user_id,
//       user.sede_id,
//       user.name,
//       `El campo activoTerna ha sido actualizado a ${activoTerna}`,
//       "Actualización de campo activoTerna"
//     );

//     res.status(200).json({
//       message: "Campo activoTerna actualizado exitosamente",
//       data: { user_id, activoTerna },
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error en el servidor al actualizar el campo activoTerna",
//       error: error.message,
//     });
//   }
// };

const listTernas = async (req, res) => {
  try {
    const { sede_id } = req.query;

    if (!sede_id) {
      return res.status(400).json({ message: "El parámetro sede_id es obligatorio" });
    }

    const users = await User.findAll({
      where: {
        rol_id: 2,
        sede_id: sede_id 
      },
      attributes: ["user_id", "email", "name", "profilePhoto"], 
    });

    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      userName: user.name,
      profilePhoto: user.profilePhoto ? `http://localhost:3000/public/fotoPerfil/${user.profilePhoto}` : null, 
      activoTerna: user.activoTerna,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

// const listActiveTernas = async (req, res) => {
//   try {
//     const { sede_id } = req.query;

//     if (!sede_id) {
//       return res.status(400).json({ message: "El parámetro sede_id es obligatorio" });
//     }

//     const users = await User.findAll({
//       where: {
//         rol_id: 2,
//         activoTerna: true,
//         sede_id: sede_id 
//       },
//       attributes: ["user_id", "email", "name", "profilePhoto", "activoTerna"], 
//     });

//     const formattedUsers = users.map((user) => ({
//       user_id: user.user_id,
//       email: user.email,
//       userName: user.name,
//       profilePhoto: user.profilePhoto ? `http://localhost:3000/public/fotoPerfil/${user.profilePhoto}` : null, 
//       activoTerna: user.activoTerna,
//     }));

//     res.status(200).json(formattedUsers);
//   } catch (error) {
//     res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
//   }
// };

module.exports = {
  listTernas,
  // listActiveTernas,
  // updateTernaStatus,
};
