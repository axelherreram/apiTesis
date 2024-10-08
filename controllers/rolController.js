const { Op } = require("sequelize");
const Role = require("../models/roles");

const listarRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: {
        rol_id: {
          [Op.in]: [1, 2]
        }
      }
    });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los roles", error });
  }
};

module.exports = { listarRoles };
