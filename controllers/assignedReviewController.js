const ApprovalThesis = require("../models/approvalThesis");
const AssignedReview = require("../models/assignedReviewthesis");
const RevisionThesis = require("../models/revisionThesis");
const User = require("../models/user");
const { sendEmailReviewerAsigned } = require("./emailController");
const moment = require("moment");

/**
 * The function `createAssignedReview` assigns a reviewer to a thesis revision, ensuring the user
 * exists, has the correct role, and that the revision is active and not already assigned.
 * @param req - The `req` parameter represents the HTTP request object containing the `revision_thesis_id`
 * and `user_id` in the request body.
 * @param res - The `res` parameter represents the HTTP response object used to send back the result
 * of the operation.
 * @returns A JSON response indicating success or failure, including messages if the user does not exist,
 * is not a reviewer or coordinator, if the thesis revision does not exist or is inactive, or if an
 * assignment already exists.
 */
const createAssignedReview = async (req, res) => {
  const { revision_thesis_id, user_id } = req.body;

  try {
    // Validar que el usuario exista
    const infoUser = await User.findByPk(user_id);
    if (!infoUser) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        details: `No se encontró un usuario con el ID ${user_id}. Verifica que el ID sea correcto.`,
      });
    }

    // Validar que el usuario sea un revisor (rol_id === 7)
    if (infoUser.rol_id !== 7 && infoUser.rol_id !== 6) {
      return res.status(400).json({
        message: "El usuario no es un revisor o cordinador",
        details: `El usuario no tiene el rol de revisor o cordinador. Solo los revisores pueden ser asignados a revisiones de tesis.`,
      });
    }

    // Validar que la revisión de tesis exista
    const infoRevision = await RevisionThesis.findByPk(revision_thesis_id);
    if (!infoRevision) {
      return res.status(404).json({
        message: "Revisión de tesis no encontrada",
        details: `No se encontró una revisión de tesis con el ID ${revision_thesis_id}. Verifica que el ID sea correcto.`,
      });
    }

    // Validar que la revisión esté activa (active_process: true)
    if (!infoRevision.active_process) {
      return res.status(400).json({
        message: "La revisión no está activa",
        details: `La revisión de tesis con ID ${revision_thesis_id} no está activa (active_process = false). Solo se pueden asignar revisiones activas.`,
      });
    }

    // Validar que no exista una asignación previa para esta revisión
    const existingAssignment = await AssignedReview.findOne({
      where: { revision_thesis_id },
    });
    if (existingAssignment) {
      return res.status(409).json({
        message: "La revisión ya tiene un revisor asignado",
        details: `La revisión de tesis con ID ${revision_thesis_id} ya tiene un revisor asignado. No se pueden asignar múltiples revisores a la misma revisión.`,
      });
    }

    // Crear la nueva asignación
    await AssignedReview.create({
      revision_thesis_id,
      user_id,
    });

    // cambiar el estado de la revisión a "en revisión"
    await ApprovalThesis.update(
      { status: "in revision" },
      { where: { revision_thesis_id } }
    );

    // Enviar correo al revisor asignado
    const templateVariables = {
      reviewer_name: infoUser.name,
      reviewer_date: moment().format("DD/MM/YYYY HH:mm"), 
    };

    await sendEmailReviewerAsigned(
      "Nueva revisión",
      infoUser.email,
      templateVariables
    );

    // Respuesta exitosa
    res.status(201).json({
      message: "Revisión asignada con éxito",
    });
  } catch (error) {
    console.error("Error al asignar la revisión:", error);
    res.status(500).json({
      message: "Error interno del servidor al asignar la revisión",
      details: `Ocurrió un error inesperado: ${error.message}. Por favor, contacta al administrador del sistema.`,
    });
  }
};

module.exports = {
  createAssignedReview,
};
