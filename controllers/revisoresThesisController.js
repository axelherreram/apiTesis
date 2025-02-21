const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Roles = require("../models/roles");
const { Op } = require("sequelize");

// Función para generar una contraseña aleatoria
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

// Función para validar el dominio del correo
const isValidEmail = (email) => {
  return email.endsWith("@miumg.edu.gt");
};

// Función para crear un nuevo usuario
const createRevisor = async (req, res) => {
  try {
    const { email, name, codigo } = req.body;

    // Validar que no exista un usuario con el mismo correo
    const userexist = await User.findOne({ where: { email } });
    if (userexist) {
      return res.status(400).json({
        title: "Error",
        message: "Ya existe un usuario con este correo",
      });
    }
    // Validar formato del código (carnet)
    if (codigo) {
      const carnetRegex = /^\d{4}-\d{2}-\d{4,8}$/; // Ejemplo válido: 2024-01-1234
      if (!carnetRegex.test(codigo)) {
        return res.status(400).json({
          title: "Error",
          message: "Carnet inválido, ingrese codigo completo",
        });
      }
    }

    // Validar el dominio del correo
    if (!isValidEmail(email)) {
      return res.status(400).json({
        title: "Error",
        message: "El correo debe pertenecer a universidad",
      });
    }

    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10); // Hash de la contraseña

    await User.create({
      email,
      password: hashedPassword,
      name,
      carnet: codigo,
      rol_id: 7,
    });

    res.status(201).json({
      message: "Nuevo revisor creado con éxito",
      password, // Devuelve la contraseña sin hashear si se necesita para el usuario
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al crear el usuario", error: error.message });
  }
};

// Función para obtener los revisores
const getRevisores = async (req, res) => {
  try {
    const revisores = await User.findAll({
      where: { rol_id: { [Op.in]: [6, 7] } },
      include: [{ model: Roles, as: "role", attributes: ["name"] }],
    });

    if (!revisores || revisores.length === 0) {
      return res.status(404).json({ message: "No se encontraron revisores" });
    }

    const revisoresData = revisores.map((revisor) => ({
      user_id: revisor.user_id,
      email: revisor.email,
      name: revisor.name,
      carnet: revisor.carnet,
      rol_nombre: revisor.role ? revisor.role.name : "Desconocido",
      active: revisor.active,
    }));

    res.status(200).json(revisoresData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los revisores",
      error: error.message,
    });
  }
};

// Función para editar un revisor
const editRevisor = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { email, name, codigo } = req.body;

    const revisor = await User.findByPk(user_id);
    if (!revisor) {
      return res.status(404).json({ message: "Revisor no encontrado" });
    }

    if (revisor.rol_id !== 7) {
      return res.status(400).json({ message: "El usuario no es revisor" });
    }
    // Validar formato del código (carnet)
    if (codigo) {
      const carnetRegex = /^\d{4}-\d{2}-\d{4,8}$/;
      if (!carnetRegex.test(codigo)) {
        return res.status(400).json({
          title: "Error",
          message: "Carnet inválido, ingrese codigo completo",
        });
      }
    }

    // Validar el dominio del correo
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        title: "Error",
        message: "El correo debe pertenecer a universidad",
      });
    }

    revisor.email = email || revisor.email;
    revisor.name = name || revisor.name;
    revisor.carnet = codigo || revisor.carnet;

    await revisor.save();

    res.status(200).json({ message: "Revisor actualizado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar el revisor",
      error: error.message,
    });
  }
};

module.exports = { createRevisor, getRevisores, editRevisor };
