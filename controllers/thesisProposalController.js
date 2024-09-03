const ThesisProposal = require("../models/thesisProposal");
const { logActivity } = require("../sql/appLog");
const User = require("../models/user");
const Task = require("../models/task");

const listProposalsByUser = async (req, res) => {
  const { user_id } = req.params;
  try {
    const proposals = await ThesisProposal.findAll({ where: { user_id } });
    const user = await User.findByPk(user_id);

    // Script para registrar en la bitácora
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `Solicitud de tesis subidas`,
      "Solicitud de tesis"
    );

    res.status(200).json(proposals);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las propuestas de tesis",
      error: error.message || error,
    });
  }
};

const createProposal = async (req, res) => {
  const { user_id, title, proposal } = req.body;

  try {
    // Verificar si el usuario ya tiene 3 propuestas
    const count = await ThesisProposal.count({ where: { user_id } });
    if (count >= 3) {
      return res.status(400).json({
        message:
          "No se pueden tener más de 3 propuestas. Elimine o actualice una existente.",
      });
    }

    // Buscar todas las tareas asociadas al curso y usuario
    const tareas = await Task.findAll({
      where: {
        course_id: 1, 
        sede_id: req.user.sede_id, 
        typeTask_id: 1 
      }
    });

    if (tareas.length === 0) {
      return res.status(400).json({ message: "No se encontró una tarea válida para la propuesta de tesis." });
    }

    const task_id = tareas[0].task_id;

    await ThesisProposal.create({
      user_id,
      title,
      proposal,
      task_id,
    });

    // Registrar en la bitácora
    const user = await User.findByPk(user_id);
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `El usuario creó una nueva propuesta ${title}`,
      "Creación de propuesta"
    );

    res.status(201).json({
      message: "Propuesta creada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear la propuesta de tesis",
      error: error.message || error,
    });
  }
};

const updateProposal = async (req, res) => {
  const { proposal_id } = req.params;
  const { title, proposal } = req.body;
  const user_id = req.user_id;

  try {
    const existingProposal = await ThesisProposal.findByPk(proposal_id);
    if (!existingProposal) {
      return res.status(404).json({ message: "Propuesta no encontrada" });
    }

    const user = await User.findByPk(user_id);

    existingProposal.title = title;
    existingProposal.proposal = proposal;

    await existingProposal.save();

    // Script para registrar en la bitácora
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `Actualizó propuesta con nombre: ${title}`,
      "Actualización de propuesta"
    );
    res.status(200).json({
      message: "Propuesta actualizada correctamente",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la propuesta", error });
  }
};

const deleteProposal = async (req, res) => {
  const { proposal_id } = req.params;
  const user_id = req.user_id;
  try {
    const proposal = await ThesisProposal.findByPk(proposal_id);
    if (!proposal) {
      return res.status(404).json({ message: "Propuesta no encontrada" });
    }
    await proposal.destroy();

    const user = await User.findByPk(user_id);

    // Script para registrar en la bitácora
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `Eliminó propuesta Nombre: ${proposal.title}`,
      "Eliminación de propuesta"
    );
    res.status(200).json({ message: "Propuesta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la propuesta", error });
  }
};

module.exports = {
  listProposalsByUser,
  createProposal,
  updateProposal,
  deleteProposal,
};
