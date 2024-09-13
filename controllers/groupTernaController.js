const groupTerna = require("../models/groupTerna");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");
const TernaAsignGroup = require("../models/ternaAsignGroup");

const listGroupTerna = async (req, res) => {
  const { sede_id, year_id } = req.query;
  const user_id = req.user_id;  // Obtenemos el user_id del middleware
  
  try {
    const groupTernas = await groupTerna.findAll({
      where: {
        sede_id,  // Filtra por sede_id
        year_id   // Filtra por year_id
      }
    });

    const userAdmin = await User.findOne({ where: { user_id } });

    if (!userAdmin) {
      return res.status(404).json({ message: "User not found" });
    }

    // Registrar la actividad correctamente
    await logActivity(
      user_id,  // Usamos el user_id que proviene del token
      userAdmin.sede_id,
      userAdmin.name,
      `Ternas listadas por: ${userAdmin.name}`,
      "Listado de ternas"
    );

    res.json(groupTernas);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteGroupTerna = async (req, res) => {
  const { groupTerna_id } = req.params;
  const user_id = req.user_id;  
  
  try {
    // Primero, eliminamos los registros asociados en la tabla ternaAsignGroup
    await TernaAsignGroup.destroy({
      where: { groupTerna_id }
    });

    // Luego, eliminamos el grupo de la tabla groupTerna
    await groupTerna.destroy({ where: { groupTerna_id } });

    // Buscamos al usuario que está eliminando la terna
    const user = await User.findOne({ where: { user_id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Registrar la actividad correctamente
    await logActivity(
      user_id,  
      user.sede_id,
      user.name,
      `Terna eliminada No.${groupTerna_id} por: ${user.name}`,
      "Eliminación de terna"
    );

    res.json({ message: "Terna eliminada exitosamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { listGroupTerna, deleteGroupTerna };
