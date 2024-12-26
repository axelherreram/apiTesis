const ThesisSubmission = require("../models/thesisSubmissions");
const Task = require("../models/task");
const User = require("../models/user");
const upload = require("../middlewares/uploadPdf");
const fs = require("fs");
const { addTimeline } = require("../sql/timeline");

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
          .json({ message: `La tarea con no es propuesta de tesis` });
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
          message: "Ya existe una entrega de tesis para este usuario y tarea",
        });
      }

      // Crear registro en la base de datos
      await ThesisSubmission.create({
        user_id,
        task_id,
        file_path: req.file.path,
        date: new Date(),
      });


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
 * Controlador para actualizar una entrega de tesis
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
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
