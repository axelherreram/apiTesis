const TimelineEventos = require("../models/timelineEventos");

async function addTimeline(user_id, tipoEvento, descripcion, course_id, task_id) {
  try {
    if (!user_id || !tipoEvento || !descripcion || !course_id) {
      console.error("Faltan datos para registrar el evento");
      return;
    }

    await TimelineEventos.create({
      user_id,
      tipoEvento,
      descripcion,
      course_id,
      task_id: task_id || null, // Opcionalmente se puede pasar null si no hay task_id
      fecha: new Date(), 
    });

  } catch (err) {
    console.error("Error al registrar en la línea de tiempo:", err.message || err);
  }
}

module.exports = { addTimeline };
