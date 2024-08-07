const Sede = require('../models/sede');
const { registrarBitacora } = require('../sql/bitacora');

const listarSedes = async (req, res) => {
  try {
    const sedes = await Sede.findAll();
    res.status(200).json(sedes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las sedes', error: error });
  }
};

const crearSede = async (req, res) => {
  try {
    const { nombreSede } = req.body;
    const user_id = req.user_id; 

    if (!nombreSede) {
      return res.status(400).json({ message: 'El nombre de la sede es necesario' });
    }
        
    // Aquí agregarías el registro a la bitácora
    registrarBitacora(user_id, 'Creación de sede', `Una nueva sede: (${nombreSede}), fue creada.`);
    await Sede.create({ nombreSede });


    res.status(201).json({ message: 'Sede creada satisfactoriamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la sede', error });
  }
};

  

module.exports = { listarSedes, crearSede };
