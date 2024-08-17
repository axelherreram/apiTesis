const { Op } = require("sequelize"); // Asegúrate de importar Op
const Role = require("../models/roles");

const listarRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los roles", error });
  }
};

module.exports = { listarRoles };
