const Tareas = require("../models/tareas");
const { registrarBitacora } = require("../sql/bitacora");
const Usuario = require("../models/usuarios");

const listarTareas = async (req, res) => {
  const user_id = req.user_id;
  try {
    const tareas = await Tareas.findAll();

    const User = await Usuario.findByPk(user_id);
    
    // Scrip para registrar en la bitacora
    await registrarBitacora(
      user_id,
      User.nombre,
      "Obtener todas las tareas",
      `Listo todas las tareas`
    );

    res.status(200).json(tareas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las tareas", error });
  }
};

const actualizarTarea = async (req, res) => {
  const { tarea_id } = req.params;
  const { titulo, descripcion, inicioTarea, finTarea } = req.body;
  const user_id = req.user_id;
  try {
    const tarea = await Tareas.findByPk(tarea_id);
    if (!tarea) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    tarea.titulo = titulo ?? tarea.titulo;
    tarea.descripcion = descripcion ?? tarea.descripcion;
    tarea.inicioTarea = inicioTarea ?? tarea.inicioTarea;
    tarea.finTarea = finTarea ?? tarea.finTarea;

    const User = await Usuario.findByPk(user_id);

    // Scrip para registrar en la bitacora
    await registrarBitacora(
      user_id,
      User.nombre,
      `Actualizo tarea con id: ${tarea_id}`,
      "Se actualizo tarea"
    );

    await tarea.save();

    res.status(200).json({ message: "Tarea actualizada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la tarea", error });
  }
};

module.exports = {
  listarTareas,
  actualizarTarea,
};
