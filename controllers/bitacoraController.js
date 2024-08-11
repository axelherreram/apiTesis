const BitacoraApp = require('../models/bitacoraApp'); 


const listarTodasBitacoras = async (req, res) => {
  try {
    const bitacoras = await BitacoraApp.findAll();

    if (!bitacoras || bitacoras.length === 0) {
      return res.status(404).json({ message: 'No se encontraron entradas de bitácora' });
    }

    const formattedBitacoras = bitacoras.map((bitacora) => ({
      usuario: bitacora.usuario,
      accion: bitacora.accion,
      descripcion: bitacora.detalles,
      fecha: bitacora.fecha,
    }));

    res.json({
      message: 'Lista completa de bitácoras',
      bitacoras: formattedBitacoras,
    });
  } catch (err) {
    console.error('Error al listar todas las bitácoras:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};



const listarBitacoraPorUsuario = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const bitacoras = await BitacoraApp.findAll({ where: { user_id } });

    if (!bitacoras || bitacoras.length === 0) {
      return res.status(404).json({ message: 'No se encontraron entradas de bitácora para este usuario' });
    }
    const formattedBitacoras = bitacoras.map((bitacora) => ({
      username: bitacora.usuario,
      accion: bitacora.accion,
      descripcion: bitacora.descripcion,
      fecha: bitacora.fecha,
    }));

    res.json({
      message: 'Lista de bitácoras',
      bitacoras: formattedBitacoras,
    });
  } catch (err) {
    console.error('Error al listar las bitácoras:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { listarBitacoraPorUsuario, listarTodasBitacoras };
