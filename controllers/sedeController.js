const Sede = require("../models/sede");
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

    // Crear la nueva sede
    await Sede.create({ nameSede });

    res.status(201).json({ message: "Sede creada satisfactoriamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la sede", error });
  }
};

const editSede = async (req, res) => {
  try {
    const { sede_id } = req.params;
    const { nameSede } = req.body;

    if (!nameSede) {
      return res
        .status(400)
        .json({ message: "El nombre de la sede es necesario" });
    }

    // Verificar si la sede existe
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada" });
    }

    // Actualizar el nombre de la sede
    sede.nameSede = nameSede;
    await sede.save();

    res.status(200).json({ message: "Sede actualizada satisfactoriamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la sede", error });
  }
};

module.exports = { listSede, createSede, editSede };