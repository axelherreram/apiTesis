const PropuestaTesis = require("../models/propuestaTesis");
const { registrarBitacora } = require("../sql/bitacora");

// Listar propuestas de tesis de un usuario
const listarPropuestasPorUsuario = async (req, res) => {
  const { user_id } = req.params;
  try {
    const propuestas = await PropuestaTesis.findAll({ where: { user_id } });
    res.status(200).json(propuestas);
    // Scrip para registrar en la bitacora
    registrarBitacora(
      user.user_id,
      `Solicitud de tesis subidas`,
      "Solicitud de tesis"
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las propuestas de tesis", error });
  }
};

// Crear una nueva propuesta de tesis
const crearPropuesta = async (req, res) => {
  const { user_id, titulo, propuesta } = req.body;

  try {
    const count = await PropuestaTesis.count({ where: { user_id } });
    if (count >= 3) {
      return res.status(400).json({
        message:
          "No se pueden tener más de 3 propuestas. Elimine o actualice una existente.",
      });
    }
    await PropuestaTesis.create({
      user_id,
      titulo,
      propuesta,
    });
    // Scrip para registrar en la bitacora
    registrarBitacora(
      user.user_id,
      `Creo una nueva propuesta`,
      "Creación de propuesta"
    );

    res.status(201).json({
      message: "Propuesta creada correctamente",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear la propuesta de tesis", error });
  }
};

// Actualizar una propuesta de tesis
const actualizarPropuesta = async (req, res) => {
  const { propuesta_id } = req.params;
  const { titulo, propuesta } = req.body;

  try {
    const propuestaExistente = await PropuestaTesis.findByPk(propuesta_id);
    if (!propuestaExistente) {
      return res.status(404).json({ message: "Propuesta no encontrada" });
    }
    propuestaExistente.titulo = titulo;
    propuestaExistente.propuesta = propuesta;

    await propuestaExistente.save();
    // Scrip para registrar en la bitacora
    registrarBitacora(
      user.user_id,
      `Actualizo propuesta con id ${propuesta_id}`,
      "Actualización de propuesta"
    );
    res.status(200).json({
      message: "Propuesta actualizada correctamente",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar la propuesta", error });
  }
};

// Eliminar una propuesta de tesis
const eliminarPropuesta = async (req, res) => {
  const { propuesta_id } = req.params;

  try {
    const propuesta = await PropuestaTesis.findByPk(propuesta_id);
    if (!propuesta) {
      return res.status(404).json({ message: "Propuesta no encontrada" });
    }

    await propuesta.destroy();
    // Scrip para registrar en la bitacora
    registrarBitacora(
      user.user_id,
      `Elimino propuesta con id ${propuesta_id}`,
      "Eliminación de propuesta"
    );
    res.status(200).json({ message: "Propuesta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la propuesta", error });
  }
};

module.exports = {
  listarPropuestasPorUsuario,
  crearPropuesta,
  actualizarPropuesta,
  eliminarPropuesta,
};
