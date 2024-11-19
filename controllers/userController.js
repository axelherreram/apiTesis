const User = require("../models/user");
const { logActivity } = require("../sql/appLog");
const CourseAssignment = require("../models/courseAssignment");
const Course = require("../models/course");
const Year = require("../models/year");
const Roles = require("../models/roles");

// Datos de la dashboard principal
const dataGraphics = async (req, res) => {
  const { sede_id } = req.params;

  try {
    const totalStudents = await User.count({ where: { rol_id: 1 } });
    const totalStudentsSede = await User.count({
      where: { rol_id: 1, sede_id },
    });
    // const totalStudentsClosedGlobal = await User.count({where: { rol_id: 1, closedPlan: 1 }});
    // const totalStudentsClosed = await User.count({where: { rol_id: 1, sede_id, closedPlan: 1 }});

    res.status(200).json({
      totalStudents,
      totalStudentsSede,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al obtener los datos gráficos",
        error: error.message,
      });
  }
};

// Obtener usuarios asignados a un curso
const getUsersByCourse = async (req, res) => {
  const { sede_id, course_id, year } = req.params;
  const user_id = req.user_id;

  try {
    // Verificar si el año existe
    const yearRecord = await Year.findOne({ where: { year } });
    if (!yearRecord) {
      return res.status(404).json({ message: "El año especificado no existe" });
    }
    const year_id = yearRecord.dataValues.year_id;

    // Contar usuarios asignados al curso
    const userCount = await User.count({
      where: { rol_id: 1, sede_id, year_id },
      include: [{ model: CourseAssignment, where: { course_id } }],
    });

    // Obtener usuarios
    const users = await User.findAll({
      where: { rol_id: 1, sede_id, year_id },
      include: [
        {
          model: CourseAssignment,
          where: { course_id, year_id },
          attributes: ["course_id"],
        },
      ],
      attributes: [
        "user_id",
        "email",
        "name",
        "carnet",
        "sede_id",
        "rol_id",
        "profilePhoto",
      ],
    });

    if (users.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron usuarios asignados a este curso para el año y sede especificados",
      });
    }

    // Obtener información del curso
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res
        .status(404)
        .json({ message: "No se encontró el curso especificado" });
    }

    // Usuario solicitante
    const requestingUser = await User.findByPk(user_id);
    if (!requestingUser) {
      return res
        .status(404)
        .json({ message: "No se encontró el usuario solicitante" });
    }

    // Formatear usuarios para la respuesta
    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      userName: user.name,
      profilePhoto: user.profilePhoto
        ? `${process.env.BASE_URL}/public/fotoPerfil/${user.profilePhoto}`
        : null,
      carnet: user.carnet,
    }));

    // Registrar actividad
    await logActivity(
      user_id,
      requestingUser.sede_id,
      requestingUser.name,
      "Listar estudiantes",
      `Listó todos los estudiantes del curso: ${course.courseName}`
    );

    res.status(200).json({
      countUsers: userCount,
      users: formattedUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los usuarios asignados al curso",
      error: error.message,
    });
  }
};

// Obtener usuario por token
const listuserbytoken = async (req, res) => {
  const user_id = req.user_id;

  try {
    const user = await User.findOne({
      where: { user_id },
      include: [{ model: Roles, as: "role", attributes: ["name"] }],
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const formattedUser = {
      user_id: user.user_id,
      email: user.email,
      userName: user.name,
      profilePhoto: user.profilePhoto
        ? `${process.env.BASE_URL}/public/fotoPerfil/${user.profilePhoto}`
        : null,
      carnet: user.carnet,
      sede: user.sede_id,
      registrationYear: user.registrationYear,
      roleName: user.rol_id ? user.role.name : null,
    };

    res.status(200).json(formattedUser);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el usuario",
      error: error.message,
    });
  }
};

module.exports = {
  getUsersByCourse,
  listuserbytoken,
  dataGraphics,
};
