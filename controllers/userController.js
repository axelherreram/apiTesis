const Usuarios = require('../models/usuarios');

// Listar todos los usuarios con rol de Terna 
const listUsuariosAdmin = async (req, res) => {
  try {
    const users = await Usuarios.findAll({ where: { rol_id: 2 } });

    const formattedUsers = users.map(user => ({
      email: user.email,
      userName: user.nombre,
      carnet: user.carnet,
      sede: user.sede_id,
      rol_id: user.rol_id,
      anio: user.anioRegistro,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};


// Listar usuarios con rol de estudiante (suponiendo rol_id = 1 para estudiantes)
const listStudents = async (req, res) => {
  try {
    const students = await Usuarios.findAll({ where: { rol_id: 1 } });

    const formattedStudents = students.map(student => ({
      email: student.email,
      userName: student.nombre,
      carnet: student.carnet,
      sede: student.sede_id,
      anio: student.anioRegistro,
    }));

    res.status(200).json(formattedStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estudiantes' });
  }
};

// Filtrar usuarios por sede
const filterUsersBySede = async (req, res) => {
  const { sede_id } = req.params;
  try {
    const users = await Usuarios.findAll({ where: { sede_id, rol_id: 1 } });

    const formattedUsers = users.map(user => ({
      email: user.email,
      userName: user.nombre,
      carnet: user.carnet,
      sede: user.sede_id,
      anio: user.anioRegistro,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error al filtrar usuarios por sede' });
  }
};

// Filtrar usuarios por año de registro
const filterUsersByAnio = async (req, res) => {
  const { anioRegistro } = req.params;
  try {
    const users = await Usuarios.findAll({ where: { anioRegistro, rol_id: 1 } });

    const formattedUsers = users.map(user => ({
      email: user.email,
      userName: user.nombre,
      carnet: user.carnet,
      sede: user.sede_id,
      anio: user.anioRegistro,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error al filtrar usuarios por año' });
  }
};

module.exports = {
  listStudents,
  filterUsersBySede,
  filterUsersByAnio,
  listUsuariosAdmin
};
