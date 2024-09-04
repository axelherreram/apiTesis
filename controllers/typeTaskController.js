const typeTask = require("../models/typeTask");

const listarTypeTask = async (req, res) => {
  try {
    const typeTasks = await typeTask.findAll();
    res.status(200).json(typeTasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los typeTask", error });
  }
};

module.exports = { listarTypeTask };
