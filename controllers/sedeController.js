const Sede = require('../models/sede');

const listarSedes = async (req, res) => {
  try {
    const sedes = await Sede.findAll();
    res.status(200).json(sedes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las sedes', error: error });
  }
};

// Crear una nueva sede
const crearSede = async (req, res) => {
    try {
      const { nombreSede } = req.body;
      if (!nombreSede) {
        return res.status(400).json({ message: 'El nombre de la sede es necesario' });
      }
      const nuevaSede = await Sede.create({ nombreSede });
      res.status(201).json({
        message: 'Sede creada satisfactoriamente',
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear la sede', error: error });
    }
  };
  

module.exports = { listarSedes, crearSede };
