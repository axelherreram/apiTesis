const Year = require("../models/year");

const listYears = async (req, res) => {
  try {
    const years = await Year.findAll();
    res.status(200).json(years);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener años", error: error.message });
  }
};

module.exports = {
  listYears,
};