const Task = require("../models/task");
const ThesisSubmission = require("../models/thesisSubmissions");
const User = require("../models/user");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { addTimeline } = require("../sql/timeline");

dotenv.config();

/**
 * The function `updateApprovedProposal` updates the approved proposal status for a thesis submission
 * based on certain conditions and adds an action to the timeline.
 * @param req - The function `updateApprovedProposal` is designed to handle a PUT request to update the
 * `approved_proposal` field of a thesis submission based on the `thesisSubmissions_id` and `user_id`
 * provided in the request parameters. The new `approved_proposal` value is expected to be
 * @param res - The `res` parameter in the `updateApprovedProposal` function is the response object
 * that will be used to send back the response to the client making the request. It is typically used
 * to set the status code, send JSON data, or handle errors in the response.
 * @returns The function `updateApprovedProposal` returns different responses based on the conditions
 * met during its execution. Here are the possible return scenarios:
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

    // Agregar la acción a la línea de tiempo
    await addTimeline(
      thesisSubmission.user_id,
      "Propuesta de tesis aprobada",
      `La propuesta de tesis numero ${approved_proposal} ha sido aprobada`,
      thesisSubmission.task_id
    );

    res.status(200).json({
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
 * The function `getThesisSubmission` retrieves and formats thesis submission data based on a user ID,
 * handling errors appropriately.
 * @param req - The `req` parameter in the `getThesisSubmission` function stands for the request
 * object, which represents the HTTP request that comes from the client to the server. It contains
 * information about the request made by the client, such as the parameters, headers, body, and other
 * details.
 * @param res - The `res` parameter in the `getThesisSubmission` function is the response object that
 * will be used to send the response back to the client making the request. It is typically used to
 * send HTTP responses with status codes, headers, and data in the form of JSON or other formats. In
 * @returns The `getThesisSubmission` function returns a JSON response with the thesis submission
 * details if the submission is found based on the `user_id`. If the submission is not found, a 404
 * status with a message indicating "Entrega de tesis no encontrada" is returned. If there is an error
 * during the process, a 500 status with a generic error message is returned.
 */
const getThesisSubmission = async (req, res) => {
  const { user_id } = req.params;

  try {
    // Buscar la entrega de tesis basada en user_id
    const thesisSubmission = await ThesisSubmission.findOne({
      where: { user_id },
    });

    // Verificar si la entrega de tesis existe
    if (!thesisSubmission) {
      return res.status(404).json({
        message: "Entrega de tesis no encontrada",
      });
    }

    // Reemplazar las barras invertidas (\) por barras diagonales (/)
    const correctedFilePath = thesisSubmission.file_path.replace(/\\/g, "/");

    // Formatear la respuesta solo con los campos requeridos
    const response = {
      thesisSubmissions_id: thesisSubmission.thesisSubmissions_id,
      file_path: encodeURI(`${process.env.BASE_URL}/${correctedFilePath}`),
      date: thesisSubmission.date,
      approved_proposal: thesisSubmission.approved_proposal,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener la entrega de tesis:", error);

    res.status(500).json({
      message:
        "Error inesperado al procesar la solicitud. Por favor, inténtelo más tarde.",
    });
  }
};

module.exports = {
  updateApprovedProposal,
  getThesisSubmission,
};
