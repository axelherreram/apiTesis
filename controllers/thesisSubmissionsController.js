const ThesisSubmission = require("../models/thesisSubmissions");
const Task = require("../models/task");
const User = require("../models/user");
const upload = require("../middlewares/uploadPdf");
const fs = require("fs");

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
        message: "Faltan campos requeridos: user_id y task_id son obligatorios",
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

        return res.status(404).json({ message: `El usuario con ID ${user_id} no existe` });
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

        return res.status(404).json({ message: `La tarea con ID ${task_id} no existe` });
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

        return res.status(400).json({ message: `La tarea con ID ${task_id} no es una tesis` });
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
      const newSubmission = await ThesisSubmission.create({
        user_id,
        task_id,
        file_path: req.file.path,
        date: new Date(),
      });

      res.status(201).json({
        message: "Propuesta de tesis subida exitosamente",
        data: newSubmission,
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

module.exports = {
  uploadProposal,
};
