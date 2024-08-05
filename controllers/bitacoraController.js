const BitacoraApp = require('../models/bitacoraApp'); 

const listarBitacoraPorUsuario = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const bitacoras = await BitacoraApp.findAll({ where: { user_id } });

    if (!bitacoras || bitacoras.length === 0) {
      return res.status(404).json({ message: 'No se encontraron entradas de bitácora para este usuario' });
    }

    res.json(bitacoras);
  } catch (err) {
    console.error('Error al listar las bitácoras:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { listarBitacoraPorUsuario };
