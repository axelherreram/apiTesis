const Submissions = require("../models/submissions");
const User = require("../models/user");
const { logActivity } = require("../sql/appLog");

const aprobProposal = async (req, res) => {
  try {
    const {
      user_id,
      submission_id,
      approved_proposal,
    } = req.body;

    // validar que el estudiante exista
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }
    
    // validar que la entrega exista
    const submission = await Submissions.findByPk(submission_id);
    if (!submission) {
      return res.status(404).json({
        message: "Propuesta no encontrada",
      });
    }

    // validar que la propuesta sea aprobada
    if (
      approved_proposal !== 1 &&
      approved_proposal !== 2 &&
      approved_proposal !== 3
    ) {
      return res.status(400).json({
        message: "Número de propuesta inválido",
      });
    }

    // Actualizar la propuesta
    await Submissions.update(
      {  approved_proposal },
      {
        where: {
          user_id,
          submission_id,
        },
      }
    );

    // Registrar la actividad del usuario
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `Se aprobo la propuesta: ${approved_proposal}, para el estudiante: ${user.name}`,
      "Propuesta aprobada"
    );

    res.status(200).json({
      message: "Propuesta actualizada",
    });
  } catch (error) {
    console.error("Error al aprobar la propuesta:", error);
    res.status(500).json({
      message: "Error al procesar la solicitud",
      error: error.message || error,
    });
  }
};

module.exports = { aprobProposal };
