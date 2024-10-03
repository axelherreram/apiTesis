const User = require("../models/user");
const { logActivity } = require("../sql/appLog");
// const Sede = require("../models/sede");
const CourseAssignment = require("../models/courseAssignment");
const Course = require("../models/course");
const Year = require("../models/year");
const Roles = require("../models/roles");
const { Op } = require('sequelize');
const { sequelize } = require("../config/database");
// Listar todos los estudiantes

/* const listStudents = async (req, res) => {
  try {
    const students = await User.findAll({ where: { rol_id: 1 } });
    const user_id = req.user_id;

    const formattedStudents = students.map((student) => {
      const profilePhoto = student.dataValues.profilePhoto;
      const profilePhotoUrl = profilePhoto
        ? `http://localhost:3000/public/fotoPerfil/${profilePhoto}`
        : null;

      return {
        user_id: student.user_id,
        email: student.email,
        userName: student.name,
        profilePhoto: profilePhotoUrl,
        carnet: student.carnet,
        sede: student.sede_id,
        registrationYear: student.registrationYear,
      };
    });

    const requestingUser = await User.findByPk(user_id);

    // Registrar en la bitácora
    await logActivity(
      user_id,
      requestingUser.sede_id,
      requestingUser.name,
      "Listar estudiantes",
      "Listo todos los estudiantes"
    );

    res.status(200).json(formattedStudents);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener estudiantes", error: error.message });
  }
}; */

// Filtrar usuarios por sede
/* const filterUsersBySede = async (req, res) => {
  const { sede_id } = req.params;
  const user_id = req.user_id;

  try {
    const sede = await Sede.findOne({ where: { sede_id } });

    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada" });
    }

    const students = await User.findAll({
      where: { rol_id: 1, sede_id },
      attributes: [
        "user_id",
        "email",
        "name",
        "carnet",
        "registrationYear",
        "sede_id",
        "rol_id",
        "profilePhoto",
      ],
    });

    const formattedStudents = students.map((student) => {
      const profilePhoto = student.dataValues.profilePhoto;
      const profilePhotoUrl = profilePhoto
        ? `http://localhost:3000/public/fotoPerfil/${profilePhoto}`
        : null;

      return {
        user_id: student.user_id,
        email: student.email,
        userName: student.name,
        profilePhoto: profilePhotoUrl,
        carnet: student.carnet,
        sede: student.sede_id,
        registrationYear: student.registrationYear,
      };
    });

    const requestingUser = await User.findByPk(user_id);

    // Registrar en la bitácora
    await logActivity(
      user_id,
      requestingUser.sede_id,
      requestingUser.name,
      "Listar estudiantes",
      `Listo todos los estudiantes de la sede: ${sede.nameSede}`
    );

    res.status(200).json(formattedStudents);
  } catch (error) {
    res.status(500).json({ message: "Error al filtrar usuarios por sede", error: error.message });
  }
}; */

/* // Filtrar usuarios por año de registro
const filterUsersByYear = async (req, res) => {
  const { sede_id, registrationYear } = req.params;
  const user_id = req.user_id;

  try {
    // Validar año de registro
    if (!registrationYear || isNaN(registrationYear)) {
      return res.status(400).json({ message: "Año de registro inválido" });
    }

    // Buscar usuarios por sede y año de registro
    const users = await User.findAll({
      where: { registrationYear, rol_id: 1, sede_id },
    });

    // Verificar si se encontraron usuarios
    if (users.length === 0) {
      return res.status(404).json({ message: `No se encontraron usuarios registrados en el año ${registrationYear}` });
    }

    // Formatear los usuarios
    const formattedUsers = users.map((user) => {
      const profilePhoto = user.dataValues.profilePhoto;
      const profilePhotoUrl = profilePhoto
        ? `http://localhost:3000/public/fotoPerfil/${profilePhoto}`
        : null;

      return {
        user_id: user.user_id,
        email: user.email,
        userName: user.name,
        profilePhoto: profilePhotoUrl,
        carnet: user.carnet,
        sede: user.sede_id,
        registrationYear: user.registrationYear,
      };
    });

    const requestingUser = await User.findByPk(user_id);

    // Registrar en la bitácora
    await logActivity(
      user_id,
      requestingUser.sede_id,
      requestingUser.name,
      "Listar estudiantes",
      `Listó todos los estudiantes del año ${registrationYear}`
    );

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({
      message: "Error al filtrar usuarios por año",
      error: error.message,
    });
  }
};
 */

const getUsersByCourse = async (req, res) => {
  const { sede_id, course_id, year } = req.params;
  const user_id = req.user_id;

  try {
    // Verificar si el año existe en la tabla 'Year' y obtener el 'id'
    const yearRecord = await Year.findOne({ where: { year: year } });

    if (!yearRecord) {
      return res.status(404).json({ message: "El año especificado no existe" });
    }
    const year_id = yearRecord.dataValues.year_id;

    const userCount = await User.count({
      where: { rol_id: 1, sede_id, year_id },
      include: [
        {
          model: CourseAssignment,
          where: { course_id },
        },
      ],
    });
    // Buscar usuarios con rol de estudiante (rol_id: 1), que pertenezcan a la sede y al año de registro
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

    // Si no se encuentran usuarios
    if (users.length === 0) {
      return res
        .status(404)
        .json({
          message:
            "No se encontraron usuarios asignados a este curso para el año y sede especificados",
        });
    }

    // Buscar información del curso
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
    const formattedUsers = users.map((user) => {
      const profilePhotoUrl = user.profilePhoto
        ? `http://localhost:3000/public/fotoPerfil/${user.profilePhoto}`
        : null;

      return {
        user_id: user.user_id,
        email: user.email,
        userName: user.name,
        profilePhoto: profilePhotoUrl,
        carnet: user.carnet,
      };
    });

    // Registrar actividad en la bitácora
    await logActivity(
      user_id,
      requestingUser.sede_id,
      requestingUser.name,
      "Listar estudiantes",
      `Listo todos los estudiantes del curso: ${course.courseName}`
    );

    res.status(200).json({
      countUsers: userCount,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error al obtener los usuarios asignados al curso:", error);
    res
      .status(500)
      .json({
        message: "Error al obtener los usuarios asignados al curso",
        error: error.message,
      });
  }
};

const listuserbytoken = async (req, res) => {
  const user_id = req.user_id;
  try {
    const user = await User.findOne({
      where: { user_id },
      include: [
        {
          model: Roles,
          as: "role",
          attributes: ["name"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const profilePhoto = user.profilePhoto;
    const profilePhotoUrl = profilePhoto
      ? `http://localhost:3000/public/fotoPerfil/${profilePhoto}`
      : null;

    const formattedUser = {
      user_id: user.user_id,
      email: user.email,
      userName: user.name,
      profilePhoto: profilePhotoUrl,
      carnet: user.carnet,
      sede: user.sede_id,
      registrationYear: user.registrationYear,
      roleName: user.rol_id ? user.role.name : null,
    };

    res.status(200).json(formattedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el usuario", error: error.message });
  }
};

const listStudentNotTerna = async (req, res) => {
  const { sede_id, year} = req.params;
  const user_id = req.user_id;

  try {
    // Verificar si el año existe en la tabla 'Year' y obtener el 'id'
    const yearRecord = await Year.findOne({ where: { year: year } });

    if (!yearRecord) {
      return res.status(404).json({ message: "El año especificado no existe" });
    }

    const year_id = yearRecord.year_id;

    // Obtener los estudiantes que no están asignados en la tabla ternaAsignStudent
    const users = await User.findAll({
      where: {
        rol_id: 1,
        sede_id,
        year_id,
        user_id: {
          [Op.notIn]: sequelize.literal(`(SELECT student_id FROM ternaAsignStudent)`),
        },
      },
      include: [
        {
          model: CourseAssignment,
          where: { course_id: 2, year_id },
          attributes: ["course_id"],
        },
      ],
      attributes: [
        "user_id",
        "email",
        "name",
        "carnet",
        "profilePhoto",
      ],
    });

    // Si no se encuentran usuarios
    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No se encontraron estudiantes no asignados a la terna para este curso y sede.",
      });
    }

    // Formatear los usuarios para la respuesta
    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      userName: user.name,
      carnet: user.carnet,
      profilePhoto: user.profilePhoto
        ? `http://localhost:3000/public/fotoPerfil/${user.profilePhoto}`
        : null,
    }));

    // Registrar actividad en la bitácora
    const requestingUser = await User.findByPk(user_id);
    await logActivity(
      user_id,
      requestingUser.sede_id,
      requestingUser.name,
      "Listar estudiantes no asignados a terna",
      `Listó los estudiantes que no están asignados a ninguna terna en el año de: ${year}`
    );
    // Responder con los estudiantes encontrados
    res.status(200).json({
      countUsers: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error al obtener los estudiantes no asignados a terna:", error);
    res.status(500).json({
      message: "Error al obtener los estudiantes no asignados a terna",
      error: error.message,
    });
  }
};

module.exports = {
  // listStudents,
  // filterUsersBySede,
  // filterUsersByYear,
  getUsersByCourse,
  listuserbytoken,
  listStudentNotTerna,
};
