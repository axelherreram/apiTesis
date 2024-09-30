const Submissions = require("../models/submissions");
const Task = require("../models/task");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
const { logActivity } = require("../sql/appLog");

// Create a new submission
const createSubmission = async (req, res) => {
  const { task_id, user_id } = req.body;
  const user_idToken = req.user_id;

  // Verificar si se subió un archivo
  if (!req.file) {
    return res.status(400).json({
      message: "No se ha subido ningún archivo",
    });
  }

  const directory = path.join("uploads/submissions", req.file.filename);
  const submission_date = new Date();

  try {
    // Verificar que la tarea exista
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({
        message: "Tarea no encontrada",
      });
    }
    // Obtener la información del usuario del token
    const userToken = await User.findByPk(user_idToken);

    // Verificar que el usuario exista
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }
    const submissionExists = await Submissions.findOne({
      where: { task_id, user_id },
    });
    if (submissionExists) {
      return res.status(400).json({
        message: "Ya existe una entrega para esta tarea",
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
      "Creación de tarea"
    );

    res.status(201).json({
      message: "Entrega realizada exitosamente",
    });
  } catch (error) {
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
    const listSubmissions = submissions.map((submission) => {
      return {
        submission_id: submission.submission_id,
        directory: `http://localhost:3000/public/${submission.directory}`,
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
    const task = await Task.findByPk(submission.task_id);

    // Obtener la información del usuario
    const userToken = await User.findByPk(user_idToken);

    const filePath = path.join(__dirname, "../public", submission.directory);

    // Verificar si el archivo existe antes de intentar eliminarlo
    if (fs.existsSync(filePath)) {
      // Eliminar el archivo
      fs.unlink(filePath, async (err) => {
        if (err) {
          console.error("Error al eliminar el archivo:", err);
          return res.status(500).json({
            message: "Error al eliminar el archivo de la entrega",
          });
        }

        // Registrar la actividad del usuario después de eliminar el archivo
        await logActivity(
          user_idToken,
          userToken.sede_id,
          userToken.name,
          `El estudiante: ${userToken.name}, ha eliminado la entrega para la tarea: ${task.title}`,
          "Eliminación de entrega"
        );

        // Eliminar el registro de la base de datos
        await submission.destroy();

        // Responder con éxito
        return res.status(200).json({
          message: "Entrega eliminada exitosamente junto con su archivo",
        });
      });
    } else {
      // Si el archivo no existe, devolver un error
      return res.status(404).json({
        message: "Error al eliminar la entrega: archivo no encontrado",
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
    const task = await Task.findByPk(submission.task_id);

    if (req.file) {
      // Construir la ruta completa del archivo anterior
      const currentDirectory = path.join(
        __dirname,
        "../public",
        submission.directory
      );
      // Intenta eliminar el archivo anterior si existe
      if (fs.existsSync(currentDirectory)) {
        fs.unlinkSync(currentDirectory);
      } else {
        console.log(
          "Archivo anterior no encontrado en la ruta especificada:",
          currentDirectory
        );
      }
      // Obtener la información del usuario del token
      const userToken = await User.findByPk(user_idToken);

      // Construir la nueva ruta del archivo dentro de "public/uploads/submissions"
      const newDirectory = path.join("/uploads/submissions", req.file.filename);

      // Registrar la actividad del usuario
      await logActivity(
        user_idToken,
        userToken.sede_id,
        userToken.name,
        `Entrega actualizada por: ${userToken.name} para la tarea: ${task.title}`,
        "Actualización de entrega"
      );
  
      // Actualizar la información de la entrega en la base de datos
      await submission.update({
        directory: newDirectory,
      });

      res.status(200).json({
        message: "Entrega actualizada exitosamente",
        submission: {
          ...submission.toJSON(),
          directory: newDirectory,
        },
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
