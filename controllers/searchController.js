const { Op } = require("sequelize");
const User = require("../models/user");
const Sede = require("../models/sede");

// Buscar estudiantes por carnet
const searchStudentByCarnet = async (req, res) => {
  const { carnet } = req.query;
  const { sede_id: tokenSedeId } = req;

  // Validar que se envíe el parámetro carnet
  if (!carnet) {
    return res.status(400).json({
      message: "El parámetro 'carnet' es obligatorio.",
    });
  }

  // Validar que el carnet tenga al menos el formato "1890-21"
  const carnetPattern = /^[0-9]{4}-[0-9]{2}(-[0-9]+)?$/; // Formato "1890-21"
  if (!carnetPattern.test(carnet)) {
    return res.status(400).json({
      message:
        "El parámetro 'carnet' debe incluir al menos el código de carrera y el año en formato 'XXXX-YY'.",
    });
  }

  try {
    // Realizar la búsqueda de estudiantes, filtrando por sede_id
    const students = await User.findAll({
      where: {
        carnet: {
          [Op.like]: `${carnet}%`,
        },
        rol_id: 1, // Solo estudiantes
        sede_id: tokenSedeId,
      },
      attributes: ["user_id", "name", "carnet", "email", "profilePhoto", "sede_id"],
    });

    // Verificar si se encontraron estudiantes
    if (students.length === 0) {
      return res.status(404).json({
        message: "No se encontraron estudiantes con ese carnet en esta sede.",
      });
    }

    // Formatear estudiantes para la respuesta
    const formattedUsers = students.map((student) => ({
      user_id: student.user_id,
      email: student.email,
      userName: student.name,
      profilePhoto: student.profilePhoto
        ? `${process.env.BASE_URL}/public/fotoPerfil/${student.profilePhoto}`
        : null,
      carnet: student.carnet,
      sede: student.sede_id,
    }));

    res.status(200).json({ formattedUsers });
  } catch (error) {
    console.error("Error al buscar estudiantes:", error);
    res.status(500).json({
      message: "Error al buscar estudiantes.",
      error: error.message || error,
    });
  }
};

// Buscar catedráticos por carnet
const searchProfessorByCarnet = async (req, res) => {
  const { carnet } = req.query;
  const { sede_id: tokenSedeId } = req;

  // Validar que se envíe el parámetro carnet
  if (!carnet) {
    return res.status(400).json({
      message: "El parámetro 'carnet' es obligatorio.",
    });
  }

  // Validar que el carnet tenga al menos el formato "1890-21"
  const carnetPattern = /^[0-9]{4}-[0-9]{2}(-[0-9]+)?$/;
  if (!carnetPattern.test(carnet)) {
    return res.status(400).json({
      message:
        "El parámetro 'carnet' debe incluir al menos el código de carrera y el año en formato 'XXXX-YY'.",
    });
  }

  try {
    // Realizar la búsqueda de catedráticos
    const professors = await User.findAll({
      where: {
        carnet: {
          [Op.like]: `${carnet}%`,
        },
        rol_id: 2, // Solo catedráticos
        sede_id: tokenSedeId,
      },
      attributes: ["user_id", "name", "carnet", "email", "profilePhoto", "sede_id"],
    });

    // Verificar si se encontraron catedráticos
    if (professors.length === 0) {
      return res.status(404).json({
        message: "No se encontraron catedráticos con ese carnet en esta sede.",
      });
    }

    // Formatear catedráticos para la respuesta
    const formattedProfessors = professors.map((professor) => ({
      user_id: professor.user_id,
      email: professor.email,
      userName: professor.name,
      profilePhoto: professor.profilePhoto
        ? `${process.env.BASE_URL}/public/fotoPerfil/${professor.profilePhoto}`
        : null,
      carnet: professor.carnet,
      sede: professor.sede_id,
    }));

    res.status(200).json({ formattedProfessors });
  } catch (error) {
    console.error("Error al buscar catedráticos:", error);
    res.status(500).json({
      message: "Error al buscar catedráticos.",
      error: error.message || error,
    });
  }
};

// Buscar estudiantes por carnet (sin validación de sede, para el decano)
const searchStudentByCarnetWithoutSede = async (req, res) => {
  const { carnet } = req.query;

  // Validar que se envíe el parámetro carnet
  if (!carnet) {
    return res.status(400).json({
      message: "El parámetro 'carnet' es obligatorio.",
    });
  }

  // Validar que el carnet tenga al menos el formato "1890-21"
  const carnetPattern = /^[0-9]{4}-[0-9]{2}(-[0-9]+)?$/;
  if (!carnetPattern.test(carnet)) {
    return res.status(400).json({
      message:
        "El parámetro 'carnet' debe incluir al menos el código de carrera y el año en formato 'XXXX-YY'.",
    });
  }

  try {
    // Realizar la búsqueda de estudiantes sin el filtro de sede_id
    const students = await User.findAll({
      where: {
        carnet: {
          [Op.like]: `${carnet}%`,
        },
        rol_id: 1,
      },
      attributes: ["user_id", "name", "carnet", "email", "profilePhoto", "sede_id"],
    });

    // Verificar si se encontraron estudiantes
    if (students.length === 0) {
      return res.status(404).json({
        message: "No se encontraron estudiantes con ese carnet.",
      });
    }

    // Formatear estudiantes con información de la sede
    const formattedUsers = await Promise.all(
      students.map(async (student) => {
        const sede = await Sede.findOne({
          where: { sede_id: student.sede_id },
          attributes: ["nameSede"],
        });

        return {
          user_id: student.user_id,
          email: student.email,
          userName: student.name,
          profilePhoto: student.profilePhoto
            ? `${process.env.BASE_URL}/public/fotoPerfil/${student.profilePhoto}`
            : null,
          carnet: student.carnet,
          Sede: sede ? sede.nameSede : null,
        };
      })
    );

    res.status(200).json({ formattedUsers });
  } catch (error) {
    console.error("Error al buscar estudiantes:", error);
    res.status(500).json({
      message: "Error al buscar estudiantes.",
      error: error.message || error,
    });
  }
};

module.exports = {
  searchStudentByCarnet,
  searchProfessorByCarnet,
  searchStudentByCarnetWithoutSede,
};
