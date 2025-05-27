const User = require("../models/user");
const Sede = require("../models/sede");
const Course = require("../models/course");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const Year = require("../models/year");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

/**
 * Generates a random password with specified length
 * @param {number} length - Length of the password
 * @returns {string} Random password
 */
const generateRandomPassword = (length = 8) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

/**
 * Creates a new Course-Sede relationship with user information
 * @param {Object} req - Request object containing name, email, carnet, and sede_id
 * @param {Object} res - Response object
 * @returns {Object} JSON response with success or error message
 */
const createCorSede = async (req, res) => {
  const { name, email, carnet, sede_id } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !carnet || !sede_id) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios (name, email, carnet, sede_id)"
      });
    }

    // Validate email domain
    const emailDomain = "@miumg.edu.gt";
    if (!email.endsWith(emailDomain)) {
      return res.status(400).json({
        message: `El correo debe pertenecer al dominio ${emailDomain}`
      });
    }

    // Check if sede exists
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res.status(404).json({
        message: "La sede especificada no existe"
      });
    }

    // Check if user already exists in the sede
    const existingUserInSede = await User.findOne({
      where: {
        sede_id,
        rol_id: 4 // Verificar que sea un coordinador de sede
      }
    });

    if (existingUserInSede) {
      return res.status(409).json({
        message: "Ya existe un coordinador asignado a esta sede"
      });
    }

    // Check if user already exists (by email or carnet)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { carnet }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Ya existe un usuario con este correo o carnet"
      });
    }

    // Get current year
    const currentYear = new Date().getFullYear();
    const [yearRecord] = await Year.findOrCreate({
      where: { year: currentYear },
      defaults: { year: currentYear }
    });

    // Generate random password
    const randomPassword = generateRandomPassword(12);
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    // Create user
    await User.create({
      name,
      email,
      carnet,
      sede_id,
      rol_id: 4,
      password: hashedPassword
    });


    res.status(201).json({
      message: "Coordinador creado exitosamente ",
    });

  } catch (error) {
    console.error("Error al crear usuario y asignaciones:", error);
    res.status(500).json({
      message: "Error al crear usuario y asignaciones",
      error: error.message
    });
  }
};

/**
 * Lists all users with role 4 (sede coordinators) including their sede information
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} JSON response with list of sede coordinators
 */
const listSedeCoordinators = async (req, res) => {
  try {
    const coordinators = await User.findAll({
      where: { rol_id: 4 },
      include: [{
        model: Sede,
        as: 'location',
        attributes: ['nameSede']
      }],
      attributes: ['user_id', 'name', 'email', 'carnet', 'sede_id']
    });

    res.status(200).json({
      message: "Coordinadores de sede recuperados exitosamente",
      data: coordinators
    });
  } catch (error) {
    console.error("Error al listar coordinadores de sede:", error);
    res.status(500).json({
      message: "Error al listar coordinadores de sede",
      error: error.message
    });
  }
};

/**
 * Removes a sede coordinator from a sede
 * @param {Object} req - Request object containing user_id and sede_id
 * @param {Object} res - Response object
 * @returns {Object} JSON response with success or error message
 */
const removeSedeCoordinator = async (req, res) => {
  const { user_id, sede_id } = req.body;

  try {
    // Validate required fields
    if (!user_id || !sede_id) {
      return res.status(400).json({
        message: "Se requieren user_id y sede_id"
      });
    }

    // Check if sede exists
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res.status(404).json({
        message: "La sede especificada no existe"
      });
    }

    // Find the user and verify they are a sede coordinator
    const user = await User.findOne({
      where: {
        user_id,
        rol_id: 4,
        sede_id
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "No se encontró un coordinador de sede con los datos proporcionados"
      });
    }

    // Remove the user's sede assignment
    await user.update({ sede_id: null });

    res.status(200).json({
      message: "Coordinador de sede removido exitosamente"
    });
  } catch (error) {
    console.error("Error al remover coordinador de sede:", error);
    res.status(500).json({
      message: "Error al remover coordinador de sede",
      error: error.message
    });
  }
};

/**
 * Assigns a sede coordinator to a sede
 * @param {Object} req - Request object containing user_id and sede_id
 * @param {Object} res - Response object
 * @returns {Object} JSON response with success or error message
 */
const assignSedeCoordinator = async (req, res) => {
  const { user_id, sede_id } = req.body;

  try {
    // Validate required fields
    if (!user_id || !sede_id) {
      return res.status(400).json({
        message: "Se requieren user_id y sede_id"
      });
    }

    // Check if sede exists
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res.status(404).json({
        message: "La sede especificada no existe"
      });
    }

    // Check if user exists and is a sede coordinator
    const user = await User.findOne({
      where: {
        user_id,
        rol_id: 4
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "No se encontró un coordinador de sede con el ID proporcionado"
      });
    }

    // Check if sede already has a coordinator
    const existingCoordinator = await User.findOne({
      where: {
        sede_id,
        rol_id: 4
      }
    });

    if (existingCoordinator) {
      return res.status(409).json({
        message: "La sede ya tiene un coordinador asignado"
      });
    }

    // Assign the user to the sede
    await user.update({ sede_id });

    res.status(200).json({
      message: "Coordinador de sede asignado exitosamente"
    });
  } catch (error) {
    console.error("Error al asignar coordinador de sede:", error);
    res.status(500).json({
      message: "Error al asignar coordinador de sede",
      error: error.message
    });
  }
};

module.exports = {
  createCorSede,
  listSedeCoordinators,
  removeSedeCoordinator,
  assignSedeCoordinator
}; 