const Sede = require("../models/sede");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");

const listSede = async (req, res) => {
  try {
    const locations = await Sede.findAll();
    res.status(200).json(locations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las sedes", error: error });
  }
};

const createSede = async (req, res) => {
  try {
    const { nameSede } = req.body;
    const user_id = req.user_id;

    if (!nameSede) {
      return res
        .status(400)
        .json({ message: "El nombre de la sede es necesario" });
    }

    // Verificar si la sede ya existe
    const existingSede = await Sede.findOne({ where: { nameSede } });
    if (existingSede) {
      return res
        .status(409)
        .json({ message: `La sede '${nameSede}' ya existe` });
    }

    const user = await User.findByPk(user_id);

    // Script para registrar en la bitácora
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      "Creación de sede",
      `Una nueva sede: (${nameSede}), fue creada.`
    );

    // Crear la nueva sede
    await Sede.create({ nameSede });

    res.status(201).json({ message: "Sede creada satisfactoriamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la sede", error });
  }
};


module.exports = { listSede, createSede };
