const Tareas = require("../models/tareas");

const listarTareas = async (req, res) => {
  try {
    const tareas = await Tareas.findAll();

    res.status(200).json(tareas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las tareas", error });
  }
};

const actualizarTarea = async (req, res) => {
  const { tarea_id } = req.params;
  const { titulo, descripcion, inicioTarea, finTarea } = req.body;
  try {
    const tarea = await Tareas.findByPk(tarea_id);
    if (!tarea) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    tarea.titulo = titulo ?? tarea.titulo;
    tarea.descripcion = descripcion ?? tarea.descripcion;
    tarea.inicioTarea = inicioTarea ?? tarea.inicioTarea;
    tarea.finTarea = finTarea ?? tarea.finTarea;

    await tarea.save();
    res.status(200).json({ message: "Tarea actualizada exitosamente"});
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la tarea", error });
  }
};

module.exports = {
  listarTareas,
  actualizarTarea,
};
