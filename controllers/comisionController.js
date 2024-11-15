const Comisiones = require("../models/comisiones");
const GroupComision = require("../models/groupComision");
const rolComision = require("../models/rolComision");
const User = require("../models/user");
const Year = require("../models/year");
const { logActivity } = require("../sql/appLog");


// Crear grupo de comisión y asignar usuarios
const createGroupComision = async (req, res) => {
  const { year, sede_id, groupData } = req.body;

  try {
    // Verificar año y sede
    const yearData = await Year.findOne({ where: { year } });
    if (!yearData) {
      return res.status(404).json({ message: "Año no encontrado" });
    }
    const year_id = yearData.year_id;

    const group = await GroupComision.create({ year_id, sede_id });

    for (const member of groupData) {
      const { user_id, rol_comision_id } = member;

      const user = await User.findByPk(user_id);
      const rol = await rolComision.findByPk(rol_comision_id);

      if (user && rol) {
        await Comisiones.create({
          group_id: group.group_id,
          year_id,
          sede_id,
          user_id,
          rol_comision_id,
        });
      }
    }

    res.status(201).json({ message: "Grupo de comisión creado exitosamente", group });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al crear el grupo de comisión",
      error: error.message,
    });
  }
};

// Eliminar usuario de una comisión
const removeUserFromComision = async (req, res) => {
  const { group_id, user_id } = req.params;

  try {
    const comision = await Comisiones.findOne({ where: { group_id, user_id } });
    if (!comision) {
      return res.status(404).json({ message: "Usuario no encontrado en esta comisión" });
    }

    await comision.destroy();
    res.status(200).json({ message: "Usuario eliminado de la comisión exitosamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al eliminar el usuario de la comisión",
      error: error.message,
    });
  }
};

// Agregar usuario a una comisión existente
const addUserToComision = async (req, res) => {
  const { group_id } = req.params;
  const { user_id, rol_comision_id } = req.body;

  try {
    const groupExists = await GroupComision.findByPk(group_id);
    if (!groupExists) {
      return res.status(404).json({ message: "Grupo de comisión no encontrado" });
    }

    const user = await User.findByPk(user_id);
    const rol = await rolComision.findByPk(rol_comision_id);

    if (!user || !rol) {
      return res.status(400).json({ message: "Usuario o rol de comisión no válido" });
    }

    const comision = await Comisiones.create({
      group_id,
      year_id: groupExists.year_id,
      sede_id: groupExists.sede_id,
      user_id,
      rol_comision_id,
    });

    res.status(201).json({ message: "Usuario agregado a la comisión exitosamente", comision });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al agregar el usuario a la comisión",
      error: error.message,
    });
  }
};

module.exports = {
  createGroupComision,
  removeUserFromComision,
  addUserToComision,
};
