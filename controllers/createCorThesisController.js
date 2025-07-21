const User = require("../models/user");
const Year = require("../models/year");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const {sendEmailThesisCoordinatorCreation} = require("../services/emailService");

/**
 * Generates a random password with specified length
 * @param {number} length - Length of the password
 * @returns {string} Random password
 */
const generateRandomPassword = (length = 8) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

/**
 * Creates a new thesis coordinator (rol_id: 6). Only one active can exist.
 * @param {Object} req - Request object containing name, email, carnet
 * @param {Object} res - Response object
 * @returns {Object} JSON response with success or error message
 */
const createCorThesis = async (req, res) => {
  const { name, email, carnet } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !carnet) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios (name, email, carnet)",
      });
    }

    // Validate email domain
    const emailDomain = "@miumg.edu.gt";
    if (!email.endsWith(emailDomain)) {
      return res.status(400).json({
        message: `El correo debe pertenecer al dominio ${emailDomain}`,
      });
    }

    // Check if there is already an active thesis coordinator
    const existingActiveCoordinator = await User.findOne({
      where: {
        rol_id: 6,
        active: true,
      },
    });
    if (existingActiveCoordinator) {
      return res.status(409).json({
        message: "Ya existe un coordinador de tesis general activo.",
      });
    }

    // Check if user already exists (by email or carnet)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { carnet }],
      },
    });
    if (existingUser) {
      return res.status(409).json({
        message: "Ya existe un usuario con este correo o carnet",
      });
    }

    // Get current year
    const currentYear = new Date().getFullYear();
    const [yearRecord] = await Year.findOrCreate({
      where: { year: currentYear },
      defaults: { year: currentYear },
    });

    // Generate random password
    const randomPassword = generateRandomPassword(12);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    // Create user (thesis coordinator)
    await User.create({
      name,
      email,
      carnet,
      rol_id: 6,
      password: hashedPassword,
      active: true,
      year_id: yearRecord.id,
    });
    // Send email notification
    const templateVariables = {
      coordinatorName: name,
      roleName: "Coordinador de Tesis",
      email,
      password: randomPassword,
      currentDate: new Date().toLocaleDateString(),
    };
    await sendEmailThesisCoordinatorCreation(
      "Creación de Coordinador de Tesis",
      email,
      templateVariables
    );

    res.status(201).json({
      message: "Coordinador de tesis creado exitosamente ",
    });
  } catch (error) {
    console.error("Error al crear coordinador de tesis:", error);
    res.status(500).json({
      message: "Error al crear coordinador de tesis",
      error: error.message,
    });
  }
};

/**
 * Lists all thesis coordinators (rol_id: 6)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object} JSON response with list of thesis coordinators
 */
const listThesisCoordinators = async (req, res) => {
  try {
    const coordinators = await User.findAll({
      where: { rol_id: 6 },
      attributes: ["user_id", "name", "email", "carnet", "active", "profilePhoto"],
    });

    // Formatear los coordinadores para incluir la URL completa de la foto de perfil
    const formattedCoordinators = coordinators.map((coordinator) => ({
      user_id: coordinator.user_id,
      name: coordinator.name,
      email: coordinator.email,
      carnet: coordinator.carnet,
      active: coordinator.active,
      profilePhoto: coordinator.profilePhoto
        ? `${process.env.BASE_URL}/public/profilephoto/${coordinator.profilePhoto}`
        : null,
    }));

    res.status(200).json({
      message: "Coordinadores de tesis recuperados exitosamente",
      data: formattedCoordinators,
    });
  } catch (error) {
    console.error("Error al listar coordinadores de tesis:", error);
    res.status(500).json({
      message: "Error al listar coordinadores de tesis",
      error: error.message,
    });
  }
};



/**
 * Edita la información de un coordinador de tesis (name, email, carnet).
 * Si se intenta activar, valida que no exista otro coordinador de tesis activo.
 * @param {Object} req - Debe contener user_id y los campos a actualizar
 * @param {Object} res
 */
const updateThesisCoordinator = async (req, res) => {
  const { user_id, name, email, carnet } = req.body;
  try {
    if (!user_id) {
      return res.status(400).json({ message: "Se requiere user_id" });
    }
    const user = await User.findOne({ where: { user_id, rol_id: 6 } });
    if (!user) {
      return res.status(404).json({ message: "No se encontró el coordinador de tesis" });
    }
   
    // Si se quiere cambiar el email, valida dominio
    if (email && !email.endsWith("@miumg.edu.gt")) {
      return res.status(400).json({ message: "El correo debe pertenecer al dominio @miumg.edu.gt" });
    }
    // Si se quiere cambiar email/carnet, valida que no existan duplicados
    if (email || carnet) {
      const duplicate = await User.findOne({
        where: {
          rol_id: 6,
          [Op.or]: [email ? { email } : null, carnet ? { carnet } : null].filter(Boolean),
          user_id: { [Op.ne]: user_id },
        },
      });
      if (duplicate) {
        return res.status(409).json({ message: "Ya existe un usuario con este correo o carnet" });
      }
    }
    await user.update({ name, email, carnet });
    res.status(200).json({ message: "Coordinador de tesis actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar coordinador de tesis:", error);
    res.status(500).json({ message: "Error al actualizar coordinador de tesis", error: error.message });
  }
};

/**
 * Alterna el estado activo/inactivo de un coordinador de tesis (rol_id: 6).
 * Si está activo, lo desactiva. Si está inactivo, lo activa (validando que solo puede haber uno activo).
 * @param {Object} req - Debe contener user_id en el body y user_id del token autenticado
 * @param {Object} res
 */
const toggleThesisCoordinatorStatus = async (req, res) => {
  const { user_id } = req.body;
  const authenticatedUserId = req.user_id; // ID del usuario autenticado desde el token
  
  try {
    if (!user_id) {
      return res.status(400).json({ message: "Se requiere user_id" });
    }

    // Validar que el usuario no se pueda desactivar a sí mismo
    if (parseInt(user_id) === parseInt(authenticatedUserId)) {
      return res.status(400).json({ 
        message: "No puedes cambiar tu propio estado. Contacta a otro administrador." 
      });
    }

    const user = await User.findOne({ where: { user_id, rol_id: 6 } });
    if (!user) {
      return res.status(404).json({ message: "No se encontró el coordinador de tesis" });
    }
    if (user.active) {
      // Si está activo, desactivar
      await user.update({ active: false });
      return res.status(200).json({ message: "Coordinador de tesis desactivado exitosamente" });
    } else {
      // Si está inactivo, validar que no haya otro activo
      const existingActive = await User.findOne({
        where: {
          rol_id: 6,
          active: true,
          user_id: { [Op.ne]: user_id },
        },
      });
      if (existingActive) {
        return res.status(409).json({ message: "Ya existe un coordinador de tesis general activo." });
      }
      await user.update({ active: true });
      return res.status(200).json({ message: "Coordinador de tesis activado exitosamente" });
    }
  } catch (error) {
    console.error("Error al alternar estado de coordinador de tesis:", error);
    res.status(500).json({ message: "Error al alternar estado de coordinador de tesis", error: error.message });
  }
};

module.exports = {
  createCorThesis,
  listThesisCoordinators,
  updateThesisCoordinator,
  toggleThesisCoordinatorStatus,
};
