const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Roles = require("../models/roles");
const { Op } = require("sequelize");
const { sendEmailRegisterRevisor } = require("../services/emailService");

// Función para generar una contraseña aleatoria
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

// Función para validar el dominio del correo
const isValidEmail = (email) => {
  return email.endsWith("@miumg.edu.gt");
};

/**
 * The function `createRevisor` creates a new reviewer user in the system, ensuring that the email is unique,
 * the carnet (code) is valid, and the email domain belongs to the university. It also generates a random password,
 * hashes it, and stores the user details in the database.
 * @param req - The HTTP request object, containing the new reviewer's details in the request body, including
 * `email`, `name`, and `codigo` (carnet).
 * @param res - The HTTP response object used to send the result back to the client.
 * @returns A JSON response indicating the success or failure of the operation. If successful, it returns the
 * created reviewer's details including the generated password.
 */
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

    /*  // Validar formato del código (carnet)
    if (codigo) {
      const carnetRegex = /^\d{4}-\d{2}-\d{4,8}$/; // Ejemplo válido: 2024-01-1234
      if (!carnetRegex.test(codigo)) {
        return res.status(400).json({
          title: "Error",
          message: "Carnet inválido, ingrese codigo completo",
        });
      }
     } */

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
      name: name,
      carnet: codigo,
      rol_id: 7,
    });

    // Enviar correo con la contraseña
    const templateVariables = {
      name,
      email,
      password,
    };

    await sendEmailRegisterRevisor(
      "Registor en MyOnlineProject",
      email,
      templateVariables
    );

    res.status(201).json({
      message: "Nuevo revisor creado con éxito",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al crear el usuario", error: error.message });
  }
};

/**
 * The function `getRevisores` retrieves a list of reviewers (users with role IDs 6 or 7), including their associated role name.
 * It returns the user ID, email, name, carnet, role name, and active status for each reviewer.
 * If no reviewers are found, a 404 status with an appropriate message is returned.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object used to send the result back to the client.
 * @returns A JSON response containing the list of reviewers with their details if successful, or an error message if not.
 */
const getRevisores = async (req, res) => {
  try {
    const revisores = await User.findAll({
      where: { rol_id: { [Op.in]: [6, 7] } },
      include: [{ model: Roles, as: "role", attributes: ["name"] }],
      attributes: [
        "user_id",
        "email",
        "name",
        "carnet",
        "rol_id",
        "active",
        "profilePhoto",
      ],
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
      rol_id: revisor.rol_id,
      active: revisor.active,
      profilePhoto: revisor.profilePhoto
        ? `${process.env.BASE_URL}/public/profilephoto/${revisor.profilePhoto}`
        : null,
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

/**
 * The function `editRevisor` updates the information of an existing reviewer.
 * It checks if the reviewer exists, validates their role, and ensures that the carnet and email format are correct before saving the changes.
 * The revisor's email, name, and carnet are updated based on the request body.
 * If the reviewer is not found or is not a reviewer, appropriate error messages are returned.
 * @param req - The HTTP request object, containing the user_id in the parameters and the updated fields in the body.
 * @param res - The HTTP response object to send back the result.
 * @returns A JSON response indicating the success of the update or an error message if something goes wrong.
 */
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

/**
 * Alterna el estado activo/inactivo de un revisor (rol_id: 7)
 * Si está activo, lo desactiva. Si está inactivo, lo activa.
 * @param {Object} req - Debe contener user_id en el body y user_id del token autenticado
 * @param {Object} res
 */
const toggleRevisorStatus = async (req, res) => {
  try {
    const { user_id } = req.body;
    const authenticatedUserId = req.user_id; // ID del usuario autenticado desde el token

    if (!user_id) {
      return res.status(400).json({ message: "Se requiere user_id" });
    }

    // Validar que el usuario no se pueda desactivar a sí mismo
    if (parseInt(user_id) === parseInt(authenticatedUserId)) {
      return res.status(400).json({
        message:
          "No puedes cambiar tu propio estado. Contacta a otro administrador.",
      });
    }

    const revisor = await User.findByPk(user_id);
    if (!revisor || revisor.rol_id !== 7) {
      return res.status(404).json({ message: "Revisor no encontrado" });
    }
    if (revisor.active) {
      await revisor.update({ active: false });
      return res
        .status(200)
        .json({ message: "Revisor desactivado exitosamente" });
    } else {
      await revisor.update({ active: true });
      return res.status(200).json({ message: "Revisor activado exitosamente" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error al alternar el estado del revisor",
        error: error.message,
      });
  }
};

module.exports = {
  createRevisor,
  getRevisores,
  editRevisor,
  toggleRevisorStatus,
};
