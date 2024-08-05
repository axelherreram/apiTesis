const BitacoraApp = require('../models/bitacoraApp');

async function registrarBitacora(user_id, accion, detalles) {
  try {
    if (!user_id || !accion || !detalles) {
      console.error('Parámetros indefinidos o nulos:', { user_id, accion, detalles });
      return;
    }

    await BitacoraApp.create({
      user_id,
      accion,
      detalles,
    });
    console.log('Actividad registrada en la bitácora');
  } catch (err) {
    console.error('Error al registrar en la bitácora:', err);
  }
}

module.exports = { registrarBitacora };
