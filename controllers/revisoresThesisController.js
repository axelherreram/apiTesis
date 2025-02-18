const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Roles = require("../models/roles");
const { title } = require("process");

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
      where: { rol_id: 7 },
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

module.exports = { createRevisor, getRevisores };
