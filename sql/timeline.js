const TimelineEventos = require('../models/timelineEventos');



async function registrarEvento(user_id, tipoEvento, tipoEvento) {
    try {
      if (!user_id || !tipoEvento || !tipoEvento) {
        return;
      }
  
      await TimelineEventos.create({
        user_id,
        tipoEvento,
        tipoEvento,
      });
      console.log('Actividad registrada en la bitácora');
    } catch (err) {
      console.error('Error al registrar en la bitácora:', err);
    }
  }
  
