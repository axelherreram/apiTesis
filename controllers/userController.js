const Usuarios = require("../models/usuarios");
const { registrarBitacora } = require("../sql/bitacora");
const sede = require("../models/sede");
const CursoAsignacion = require("../models/cursoAsignacion");
const Cursos = require("../models/cursos");

// const listUsuariosAdmin = async (req, res) => {
//   try {
//     const users = await Usuarios.findAll({ where: { rol_id: 2 } });

//     const formattedUsers = users.map((user) => ({
//       user_id: user.user_id,
//       email: user.email,
//       userName: user.nombre,
//       fotoPerfil: user.fotoPerfil,
//       carnet: user.carnet,
//       sede: user.sede_id,
//       rol_id: user.rol_id,
//       anio: user.anioRegistro,
//     }));

//     res.status(200).json(formattedUsers);
//   } catch (error) {
//     res.status(500).json({ message: "Error al obtener usuarios" });
//   }
// };

const listStudents = async (req, res) => {
  try {
    const students = await Usuarios.findAll({ where: { rol_id: 1 } });

    const user_id = req.user_id;
    const formattedStudents = students.map((student) => ({
      user_id: student.user_id,
      email: student.email,
      userName: student.nombre,
      fotoPerfil: user.fotoPerfil,
      carnet: student.carnet,
      sede: student.sede_id,
      anio: student.anioRegistro,
    }));

    const User = await Usuarios.findByPk(user_id);

    // Scrip para registrar en la bitacora
    await registrarBitacora(
      user_id,
      User.sede_id,
      User.nombre,
      "Listar estudiantes",
      `Listo todos los estudiantes`
    );
    res.status(200).json(formattedStudents);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener estudiantes" });
  }
};

// Filtrar usuarios por sede
const filterUsersBySede = async (req, res) => {
  const { sede_id } = req.params;
  const user_id = req.user_id;

  try {
    const sedes = await sede.findOne({ where: { sede_id } });

    const users = await Usuarios.findAll({ where: { sede_id, rol_id: 1 } });

    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      userName: user.nombre,
      fotoPerfil: user.fotoPerfil,
      carnet: user.carnet,
      sede: user.sede_id,
      anio: user.anioRegistro,
    }));

    const User = await Usuarios.findByPk(user_id);

    // Scrip para registrar en la bitacora
    await registrarBitacora(
      user_id,
      User.sede_id,
      User.nombre,
      "Listar estudiantes",
      `Listo todos los estudiantes de la sede: ${sedes.nombreSede}`
    );

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error al filtrar usuarios por sede" });
  }
};

// Filtrar usuarios por año de registro
const filterUsersByAnio = async (req, res) => {
  const { anioRegistro } = req.params;
  const user_id = req.user_id;

  try {
    const users = await Usuarios.findAll({
      where: { anioRegistro, rol_id: 1 },
    });

    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      userName: user.nombre,
      fotoPerfil: user.fotoPerfil,

      carnet: user.carnet,
      sede: user.sede_id,
      anio: user.anioRegistro,
    }));

    const User = await Usuarios.findByPk(user_id);
    
    // Scrip para registrar en la bitacora
    await registrarBitacora(
      user_id,
      User.sede_id,
      User.nombre,
      "Listar estudiantes",
      `Listo todos los estudiantes del año ${anioRegistro}`
    );

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error al filtrar usuarios por año" });
  }
};



const obtenerUsuariosPorCurso = async (req, res) => {
  const { curso_id } = req.params;
  const user_id = req.user_id;

  try {
      const usuarios = await Usuarios.findAll({
          include: [
              {
                  model: CursoAsignacion,
                  where: { curso_id },
                  attributes: ['curso_id'],
              },
          ],
          attributes: ['user_id', 'email', 'nombre', 'carnet', 'anioRegistro', 'sede_id', 'rol_id', 'fotoPerfil'],
      });

      if (usuarios.length === 0) {
          return res.status(404).json({ message: "No se encontraron usuarios asignados a este curso" });
      }

      const Curso = await Cursos.findByPk(curso_id);

      const User = await Usuarios.findByPk(user_id);

      await registrarBitacora(
        user_id,
        User.sede_id,
        User.nombre,
        "Listar estudiantes",
        `Listo todos los estudiantes del curso: ${Curso.nombreCurso}`
      );

      res.status(200).json(usuarios);
  } catch (error) {
      res.status(500).json({ message: "Error al obtener los usuarios asignados al curso", error });
  }
};




module.exports = {
  listStudents,
  filterUsersBySede,
  filterUsersByAnio,
  obtenerUsuariosPorCurso,
};
