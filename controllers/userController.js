const Usuarios = require("../models/usuarios");
const { registrarBitacora } = require("../sql/bitacora");
const sede = require("../models/sede");

const listUsuariosAdmin = async (req, res) => {
  try {
    const users = await Usuarios.findAll({ where: { rol_id: 2 } });

    const formattedUsers = users.map((user) => ({
      email: user.email,
      userName: user.nombre,
      carnet: user.carnet,
      sede: user.sede_id,
      rol_id: user.rol_id,
      anio: user.anioRegistro,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

const listStudents = async (req, res) => {
  try {
    const students = await Usuarios.findAll({ where: { rol_id: 1 } });

    const user_id = req.user_id;
    const formattedStudents = students.map((student) => ({
      email: student.email,
      userName: student.nombre,
      carnet: student.carnet,
      sede: student.sede_id,
      anio: student.anioRegistro,
    }));

    await registrarBitacora(
      user_id,
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
      email: user.email,
      userName: user.nombre,
      carnet: user.carnet,
      sede: user.sede_id,
      anio: user.anioRegistro,
    }));

    await registrarBitacora(
      user_id,
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
      email: user.email,
      userName: user.nombre,
      carnet: user.carnet,
      sede: user.sede_id,
      anio: user.anioRegistro,
    }));
    await registrarBitacora(
      user_id,
      "Listar estudiantes",
      `Listo todos los estudiantes del año ${anioRegistro}`
    );

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error al filtrar usuarios por año" });
  }
};

module.exports = {
  listStudents,
  filterUsersBySede,
  filterUsersByAnio,
  listUsuariosAdmin,
};
