const ThesisSubmission = require("../models/thesisSubmissions");
const Task = require("../models/task");
const User = require("../models/user");
const upload = require("../middlewares/uploadPdf");
const fs = require("fs");
const { addTimeline } = require("../sql/timeline");
const { createNotification } = require("../sql/notification");
const { sendEmailThesisSubmission } = require("./emailController");

/**
 * The `uploadProposal` function in JavaScript handles the process of uploading a thesis proposal,
 * validating required fields, checking for existing submissions, and saving the proposal in the
 * database.
 * @param req - The `req` parameter in the `uploadProposal` function stands for the request object,
 * which contains information about the HTTP request that triggered the function. This object includes
 * data such as request headers, parameters, body, and files uploaded as part of the request. The `req`
 * object is typically provided
 * @param res - The `res` parameter in the `uploadProposal` function is the response object that will
 * be used to send back the response to the client making the request. It is typically used to send
 * HTTP responses with status codes, headers, and data back to the client. In this function, `res`
 */
const uploadProposal = async (req, res) => {
  // Subir el archivo primero
  upload.single("proposal")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Error al subir el archivo",
        error: err.message,
      });
    }

    const { user_id, task_id } = req.body;

    // Validar que los campos requeridos existan
    if (!user_id || !task_id) {
      // Eliminar el archivo subido si faltan campos requeridos
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo PDF: ${err.message}`);
          }
        });
      }

      return res.status(400).json({
        message: "Faltan campos requeridos",
      });
    }

    try {
      // Validar que el usuario exista
      const userExist = await User.findByPk(user_id);
      if (!userExist) {
        // Eliminar el archivo si el usuario no existe
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error(`Error al eliminar el archivo PDF: ${err.message}`);
            }
          });
        }

        return res.status(404).json({ message: `El usuario no existe` });
      }

      // Validar que la tarea exista
      const taskInfo = await Task.findOne({ where: { task_id } });
      if (!taskInfo) {
        // Eliminar el archivo si la tarea no existe
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error(`Error al eliminar el archivo PDF: ${err.message}`);
            }
          });
        }

        return res.status(404).json({ message: `La tarea no existe` });
      }

      // Validar que la tarea sea una tesis
      if (taskInfo.typeTask_id !== 1) {
        // Eliminar el archivo si la tarea no es de tipo tesis
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error(`Error al eliminar el archivo PDF: ${err.message}`);
            }
          });
        }

        return res
          .status(400)
          .json({ message: `La tarea no es propuesta de tesis` });
      }

      // Validar que no exista más de una entrega para el mismo usuario y tarea
      const existingSubmission = await ThesisSubmission.findOne({
        where: { user_id, task_id },
      });
      if (existingSubmission) {
        // Eliminar el archivo si ya existe una entrega
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error(`Error al eliminar el archivo PDF: ${err.message}`);
            }
          });
        }

        return res.status(400).json({
          message: "Ya existe una propuesta de tesis entregada ",
        });
      }

      // Crear registro en la base de datos
      await ThesisSubmission.create({
        user_id,
        task_id,
        file_path: req.file.path,
        date: new Date(),
      });

      //
      await addTimeline(
        user_id,
        "Entrega de propuesta de tesis",
        "Se entregó la propuesta de tesis",
        task_id
      );

      // Crear notificación
      await createNotification(
        `Entrega de propuesta de tesis por ${userExist.name}`,
        userExist.sede_id,
        user_id,
        task_id,
        "general"
      );

      //obtener el profesor de la tarea
      const userAdmin = await User.findOne({
        where: { sede_id: userExist.sede_id, rol_id: 3 },
      });

      // Enviar correo electrónico de confirmación
      const templateVariables = {
        professor: userAdmin.name,
        student: userExist.name,
        thesisTitle: taskInfo.title,
        submissionDate: new Date().toLocaleString(),
      };

      sendEmailThesisSubmission(
        "Nueva entrega de propuesta de tesis",
        userAdmin.email,
        templateVariables
      ); 

      res.status(201).json({
        message: "Propuesta de tesis entregada exitosamente",
      });
    } catch (dbError) {
      // Eliminar el archivo si ocurre un error en la base de datos
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo PDF: ${err.message}`);
          }
        });
      }

      res.status(500).json({
        message: "Error al guardar la propuesta de tesis en la base de datos",
        error: dbError.message,
      });
    }
  });
};

/**
 * The function `updateProposal` handles the updating of a thesis proposal submission, including file
 * upload, validation, database operations, and error handling.
 * @param req - The `req` parameter in the `updateProposal` function stands for the request object,
 * which contains information about the HTTP request that triggered the function. This object includes
 * data such as request headers, parameters, body, query parameters, and more. In this context, `req`
 * is used to access
 * @param res - The `res` parameter in the `updateProposal` function is the response object that will
 * be used to send a response back to the client making the request. It is typically used to send HTTP
 * responses with status codes, headers, and data back to the client. In the provided code snippet, `
 */
const updateProposal = async (req, res) => {
  // Subir el archivo primero
  upload.single("proposal")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: "Error al subir el archivo",
        error: err.message,
      });
    }

    const { thesisSubmissions_id, user_id } = req.params;

    // Validar que los campos requeridos existan
    if (!user_id || !thesisSubmissions_id) {
      // Eliminar el archivo subido si faltan campos requeridos
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo PDF: ${err.message}`);
          }
        });
      }

      return res.status(400).json({
        message: "Faltan campos requeridos",
      });
    }

    try {
      // Validar que el usuario exista
      const userExist = await User.findByPk(user_id);
      if (!userExist) {
        // Eliminar el archivo si el usuario no existe
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error(`Error al eliminar el archivo PDF: ${err.message}`);
            }
          });
        }

        return res.status(404).json({ message: `El usuario no existe` });
      }

      // Buscar la entrega de tesis
      const existingSubmission = await ThesisSubmission.findOne({
        where: { thesisSubmissions_id, user_id },
      });

      if (!existingSubmission) {
        // Eliminar el archivo si no se encuentra la entrega
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error(`Error al eliminar el archivo PDF: ${err.message}`);
            }
          });
        }

        return res
          .status(404)
          .json({ message: "Entrega de tesis no encontrada" });
      }

      // Verificar si la propuesta ya ha sido aprobada
      if ([1, 2, 3].includes(existingSubmission.approved_proposal)) {
        // Eliminar el archivo si la propuesta ya está aprobada
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error(`Error al eliminar el archivo PDF: ${err.message}`);
            }
          });
        }

        return res.status(400).json({
          message: "No se puede actualizar la propuesta, ya ha sido aprobada",
        });
      }

      // Eliminar el archivo anterior si existe
      if (existingSubmission.file_path) {
        fs.unlink(existingSubmission.file_path, (err) => {
          if (err) {
            console.error(
              `Error al eliminar el archivo anterior: ${err.message}`
            );
          }
        });
      }

      // Actualizar la entrega con el nuevo archivo si se pasa uno
      existingSubmission.file_path = req.file
        ? req.file.path
        : existingSubmission.file_path;
      existingSubmission.date = new Date();

      await existingSubmission.save();

      // Agregar a la línea de tiempo
      await addTimeline(
        user_id,
        "Entrega de propuesta de tesis actualizada",
        "Se actualizó la propuesta de tesis",
        existingSubmission.task_id
      );

      // Crear notificación
      await createNotification(
        `Entrega de propuesta de tesis actualizada por ${userExist.name}`,
        userExist.sede_id,
        user_id,
        existingSubmission.task_id,
        "general"
      );

      res.status(200).json({
        message: "Entrega de tesis actualizada exitosamente",
      });
    } catch (dbError) {
      // Eliminar el archivo si ocurre un error en la base de datos
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo PDF: ${err.message}`);
          }
        });
      }

      res.status(500).json({
        message:
          "Error al actualizar la propuesta de tesis en la base de datos",
        error: dbError.message,
      });
    }
  });
};

module.exports = {
  uploadProposal,
  updateProposal,
};
