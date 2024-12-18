const Task = require("../models/task");
const ThesisSubmission = require("../models/thesisSubmissions");
const User = require("../models/user");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Controlador para actualizar el campo approved_proposal
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateApprovedProposal = async (req, res) => {
  const { thesisSubmissions_id, user_id } = req.params;
  const { approved_proposal } = req.body;

  try {
    // Validar que approved_proposal sea 0, 1, 2 o 3
    if (![1, 2, 3].includes(parseInt(approved_proposal, 10))) {
      return res.status(400).json({
        message: "El valor de 'approved_proposal' debe ser 0, 1, 2 o 3",
      });
    }

    // Buscar la entrega de tesis basada en thesisSubmissions_id y user_id
    const thesisSubmission = await ThesisSubmission.findOne({
      where: {
        thesisSubmissions_id,
        user_id,
      },
    });

    // Verificar si la entrega de tesis existe
    if (!thesisSubmission) {
      return res
        .status(404)
        .json({ message: "Entrega de tesis no encontrada" });
    }

    // Validar si el campo approved_proposal ya fue aprobado (valor 1, 2 o 3)
    if ([1, 2, 3].includes(thesisSubmission.approved_proposal)) {
      return res.status(400).json({
        message:
          "La propuesta ya ha sido aprobada, no se puede modificar el estado",
      });
    }

    // Actualizar el campo approved_proposal
    thesisSubmission.approved_proposal = approved_proposal;
    await thesisSubmission.save();

    res
      .status(200)
      .json({
        message: `La propuesta número ${approved_proposal} ha sido aprobada con éxito.`,
      });
  } catch (error) {
    console.error("Error al actualizar el campo 'approved_proposal':", error);
    res.status(500).json({
      message:
        "Error en el servidor al actualizar el campo 'approved_proposal'",
      error: error.message,
    });
  }
};

/**
 * Controlador para obtener una entrega de tesis basada en user_id y task_id
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getThesisSubmission = async (req, res) => {
  const { user_id, task_id } = req.params;

  try {
    const taskInfo = await Task.findByPk(task_id);
    if (!taskInfo) {
      return res.status(404).json({ message: "La tarea no existe" });
    }

    if (taskInfo.typeTask_id !== 1) {
      return res
        .status(400)
        .json({ message: "La tarea no es de tipo entrega de tesis" });
    }

    // Buscar la entrega de tesis basada en user_id y task_id
    const thesisSubmission = await ThesisSubmission.findOne({
      where: {
        user_id,
        task_id,
      },
    });

    // Verificar si la entrega de tesis existe
    if (!thesisSubmission) {
      return res
        .status(404)
        .json({ message: "Entrega de tesis no encontrada" });
    }
    const formattedSubmission = {
      ...thesisSubmission.toJSON(),
      file_path: `${process.env.BASE_URL}/${thesisSubmission.file_path}`,
    };

    res.status(200).json(formattedSubmission);
  } catch (error) {
    console.error("Error al obtener la entrega de tesis:", error);
    res.status(500).json({
      message: "Error en el servidor al obtener la entrega de tesis",
      error: error.message,
    });
  }
};

module.exports = {
  updateApprovedProposal,
  getThesisSubmission,
};
