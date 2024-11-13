require('dotenv').config(); // Carga las variables de entorno

const Submissions = require("../models/submissions");
const Task = require("../models/task");
const User = require("../models/user");
const path = require("path");
const fs = require("fs").promises; // Usamos `fs.promises` para trabajar con async/await
const { logActivity } = require("../sql/appLog");

// Función para verificar si una propuesta ha sido aprobada
const isProposalApproved = (approved_proposal) => {
  return approved_proposal === 1 || approved_proposal === 2 || approved_proposal === 3;
};

// Crear nueva entrega
const createSubmission = async (req, res) => {
  const { task_id, user_id } = req.body;
  const user_idToken = req.user_id;

  try {
    // Verificar si ya existe una entrega
    const submissionExists = await Submissions.findOne({
      where: { task_id, user_id },
    });
    if (submissionExists) {
      // Si el archivo se cargó, eliminar el archivo
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({
        message: "Ya existe una entrega para esta tarea",
      });
    }

    // Verificar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({
        message: "No se ha subido ningún archivo",
      });
    }

    const directory = path.join("uploads/submissions", req.file.filename);
    const submission_date = new Date();

    // Verificar que la tarea exista
    const task = await Task.findByPk(task_id);
    if (!task) {
      await fs.unlink(req.file.path); // Elimina el archivo si la tarea no existe
      return res.status(404).json({
        message: "Tarea no encontrada",
      });
    }

    const userToken = await User.findByPk(user_idToken);
    const user = await User.findByPk(user_id);
    if (!user) {
      await fs.unlink(req.file.path); // Elimina el archivo si el usuario no existe
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Crear la nueva entrega (submission)
    const newSubmission = await Submissions.create({
      directory,
      task_id,
      user_id,
      submission_date,
    });

    // Registrar la actividad del usuario
    await logActivity(
      user_idToken,
      userToken.sede_id,
      userToken.name,
      `Entrega realizada por: ${user.name} para la tarea: ${task.title}`,
      "Entrega de tarea"
    );

    res.status(201).json({
      message: "Entrega realizada exitosamente",
      submission: newSubmission,
    });
  } catch (error) {
    console.error("Error al crear la entrega:", error);
    if (req.file) {
      await fs.unlink(req.file.path); // Elimina el archivo en caso de error general
    }
    res.status(500).json({
      message: "Error al crear la entrega",
      error: error.message || error,
    });
  }
};

const listSubmissions = async (req, res) => {
  const { user_id, task_id } = req.params;
  try {
    const submissions = await Submissions.findAll({
      where: { user_id, task_id },
    });

    if (submissions.length === 0) {
      return res.status(200).json({
        message: "No se encontraron entregas para el usuario y tarea especificados",
        submissions: [],
      });
    }

    const listSubmissions = submissions.map((submission) => {
      return {
        submission_id: submission.submission_id,
        directory: `${process.env.BASE_URL}/public/${submission.directory}`,
        submission_date: submission.submission_date,
      };
    });

    res.status(200).json(listSubmissions);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las entregas",
      error: error.message || error,
    });
  }
};

const deleteSubmissions = async (req, res) => {
  const { submission_id } = req.params;
  const user_idToken = req.user_id;

  try {
    const submission = await Submissions.findByPk(submission_id);

    if (!submission) {
      return res.status(404).json({
        message: "Entrega no encontrada",
      });
    }

    if (isProposalApproved(submission.approved_proposal)) {
      return res.status(400).json({
        message: "No es posible eliminar la entrega, porque una propuesta ha sido aprobada",
      });
    }

    const task = await Task.findByPk(submission.task_id);
    const userToken = await User.findByPk(user_idToken);
    const filePath = path.join(__dirname, "../public", submission.directory);

    try {
      await fs.unlink(filePath);
      await logActivity(
        user_idToken,
        userToken.sede_id,
        userToken.name,
        `El estudiante: ${userToken.name}, ha eliminado la entrega para la tarea: ${task.title}`,
        "Eliminación de entrega"
      );

      await submission.destroy();

      return res.status(200).json({
        message: "Entrega eliminada exitosamente",
      });
    } catch (err) {
      console.error("Error al eliminar el archivo:", err);
      return res.status(500).json({
        message: "Error al eliminar el archivo de la entrega",
      });
    }
  } catch (error) {
    console.error("Error al eliminar la entrega:", error);
    return res.status(500).json({
      message: "Error al eliminar la entrega",
      error: error.message || error,
    });
  }
};

const updateSubmission = async (req, res) => {
  const { submission_id } = req.params;
  const user_idToken = req.user_id;

  try {
    const submission = await Submissions.findByPk(submission_id);

    if (!submission) {
      return res.status(404).json({
        message: "Entrega no encontrada",
      });
    }

    if (isProposalApproved(submission.approved_proposal)) {
      return res.status(400).json({
        message: "No es posible actualizar la entrega, porque una propuesta ha sido aprobada",
      });
    }

    const task = await Task.findByPk(submission.task_id);

    if (req.file) {
      const currentDirectory = path.join(__dirname, "../public", submission.directory);

      try {
        // Intentar eliminar el archivo anterior
        await fs.unlink(currentDirectory);
      } catch (error) {
        console.log("Archivo anterior no encontrado o no se pudo eliminar en la ruta especificada:", currentDirectory);
      }

      const userToken = await User.findByPk(user_idToken);
      const newDirectory = path.join("uploads/submissions", req.file.filename);

      await logActivity(
        user_idToken,
        userToken.sede_id,
        userToken.name,
        `Entrega actualizada por: ${userToken.name} para la tarea: ${task.title}`,
        "Actualización de entrega"
      );

      // Actualizar la información en la base de datos después de eliminar el archivo anterior
      await submission.update({
        directory: newDirectory,
      });

      res.status(200).json({
        message: "Entrega actualizada exitosamente",
      });
    } else {
      res.status(400).json({
        message: "No se ha subido un nuevo archivo para actualizar",
      });
    }
  } catch (error) {
    console.error("Error durante la actualización de la entrega:", error);
    res.status(500).json({
      message: "Error al actualizar la entrega",
      error: error.message || error,
    });
  }
};

module.exports = {
  createSubmission,
  listSubmissions,
  deleteSubmissions,
  updateSubmission,
};