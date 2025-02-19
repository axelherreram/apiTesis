const { Op } = require("sequelize");
const User = require("../models/user");
const Year = require("../models/year");
const { logActivity } = require("../sql/appLog");
const { sequelize } = require("../config/database");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Asegúrate de cargar las variables de entorno
const { sendEmailCatedratico } = require("../controllers/emailController");

/**
 * The function `updateProfessorStatus` updates the active status of a user, logs the activity, and
 * returns a message based on the status change.
 * @param req - The `req` parameter typically represents the HTTP request that comes from the client to
 * the server. It contains information such as the request headers, body, parameters, and more. In the
 * provided code snippet, `req` is being used to access the request body (`req.body`), request
 * parameters (`
 * @param res - The `res` parameter in the `updateProfessorStatus` function is the response object that
 * will be used to send back the response to the client making the request. It is typically used to
 * send HTTP responses with status codes, headers, and data back to the client. In this function, `res
 * @returns The `updateProfessorStatus` function is returning different responses based on the
 * conditions met during its execution. Here are the possible responses:
 */
const updateProfessorStatus = async (req, res) => {
  const { active } = req.body; // Se acepta solo el campo 'active'
  const { user_id } = req.params;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    // Buscar al usuario por su ID
    const user = await User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validar que el usuario pertenezca a la misma sede que el token
    if (parseInt(user.sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a este usuario en esta sede" });
    }
    if (user.rol_id !== 2 || user.rol_id !== 7) {
      return res
        .status(403)
        .json({ message: "No puedes desactivar este usuario" });
    }
    // Actualizar el campo 'active'
    await User.update({ active }, { where: { user_id } });

    // Registrar actividad
    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      `El campo active ha sido actualizado a ${active}`,
      "Actualización de campo active"
    );

    // Responder según el valor de 'active'
    res.status(200).json({
      message: active
        ? "Usuario activado exitosamente"
        : "Usuario desactivado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor al actualizar el campo active",
      error: error.message,
    });
  }
};

/**
 * The function `listProfessors` retrieves a list of professors based on a specified `sede_id` after
 * performing validation checks.
 * @param req - The code you provided is a function called `listProfessors` that retrieves a list of
 * professors based on the `sede_id` parameter from the request query. Here's a breakdown of the
 * function:
 * @param res - The code you provided is a function called `listProfessors` that retrieves a list of
 * professors based on the `sede_id` parameter. Here's a breakdown of the function:
 * @returns The `listProfessors` function is returning a list of professors based on the `sede_id`
 * provided in the request query parameter. It first checks if the `sede_id` is present in the request,
 * then verifies if the `sede_id` extracted from the token matches the one in the request. If they
 * don't match, it returns a 403 status with a message
 */
const listProfessors = async (req, res) => {
  const { sede_id } = req.query;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    if (!sede_id) {
      return res
        .status(400)
        .json({ message: "El parámetro sede_id es obligatorio" });
    }

    // Verificar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res.status(403).json({ message: "No tienes acceso a esta sede" });
    }

    const users = await User.findAll({
      where: {
        rol_id: 2,
        sede_id: sede_id,
      },
      attributes: [
        "user_id",
        "email",
        "name",
        "carnet",
        "profilePhoto",
        "active",
      ],
    });

    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      userName: user.name,
      professorCode: user.carnet,
      profilePhoto: user.profilePhoto
        ? `${process.env.BASE_URL}/public/profilephoto/${user.profilePhoto}`
        : null,
      active: user.active,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener usuarios", error: error.message });
  }
};

/**
 * The function `listActiveProfessors` retrieves active professors based on specified criteria such as
 * `sede_id` and `year`, ensuring access control and filtering out professors already assigned to
 * committees.
 * @param req - The `req` parameter in the `listActiveProfessors` function represents the request
 * object in Node.js. It contains information about the HTTP request made to the server, including
 * headers, query parameters, body content, etc.
 * @param res - The function `listActiveProfessors` is an asynchronous function that retrieves a list
 * of active professors based on the provided `sede_id` and `year` parameters. Here's a breakdown of
 * the function:
 * @returns The `listActiveProfessors` function returns a list of active professors based on the
 * provided `sede_id` and `year` parameters. The function performs the following steps:
 */
const listActiveProfessors = async (req, res) => {
  const { sede_id, year } = req.query;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    if (!sede_id) {
      return res
        .status(400)
        .json({ message: "El parámetro sede_id es obligatorio" });
    }

    // Verificar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res.status(403).json({ message: "No tienes acceso a esta sede" });
    }

    // Verificar si el año existe
    const yearData = await Year.findOne({ where: { year } });
    if (!yearData) {
      return res.status(404).json({ message: "Año no encontrado" });
    }
    const year_id = yearData.year_id;

    // Buscar los usuarios que tienen active: true, sede_id correspondiente y que no están en la tabla comisiones
    const users = await User.findAll({
      where: {
        rol_id: 2, // Filtrar por rol de Profesor
        active: true,
        sede_id: sede_id,
        year_id: year_id,
        user_id: {
          [Op.notIn]: sequelize.literal(
            `(SELECT user_id FROM comisiones WHERE year_id = ${year_id})`
          ),
        },
      },
      attributes: ["user_id", "email", "name", "profilePhoto", "active"],
    });

    // Si no se encuentran usuarios
    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No se encontraron usuarios activos no asignados en comisión.",
      });
    }

    // Formatear los usuarios para la respuesta
    const formattedUsers = users.map((user) => ({
      user_id: user.user_id,
      email: user.email,
      userName: user.name,
      profilePhoto: user.profilePhoto
        ? `${process.env.BASE_URL}/public/profilephoto/${user.profilePhoto}`
        : null,
      active: user.active,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener usuarios", error: error.message });
  }
};

/**
 * The function `createProfessor` is an asynchronous function that handles the creation of a new
 * professor user in a system, performing various validations and operations before sending a response.
 * @param req - req: The request object containing data sent to the server
 * @param res - The `res` parameter in the `createProfessor` function is the response object that will
 * be used to send back the response to the client making the request. It is typically used to set the
 * status code, send JSON data, or handle errors when creating a new professor in this case.
 * @returns The function `createProfessor` is returning a JSON response with a success message
 * "Profesor creado exitosamente" and a status code of 201 (Created) if the professor creation process
 * is successful. If there are any validation errors or exceptions caught during the process, it will
 * return an appropriate error message with the corresponding status code (400 for validation errors,
 * 403 for access denied, and
 */
const createProfessor = async (req, res) => {
  const { email, name, carnet, sede_id, year } = req.body;
  const user_id = req.user_id;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    if (!email || !name || !carnet || !sede_id || !year) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    // Validar formato del código (carnet)
    if (carnet) {
      const carnetRegex = /^\d{4}-\d{2}-\d{4,6}$/; // Ejemplo válido: 2024-01-1234
      if (!carnetRegex.test(carnet)) {
        return res.status(400).json({
          title: "Error",
          message: "Carnet inválido, ingrese codigo completo",
        });
      }
    }

    const currentYear = new Date().getFullYear();

    // Verificar si el año proporcionado es mayor al año actual
    if (year > currentYear) {
      return res.status(400).json({
        message: `No se puede crear un año mayor al actual (${currentYear}).`,
      });
    }

    // Validar que el correo tenga el dominio @miumg.edu.gt
    const emailDomain = "@miumg.edu.gt";
    if (!email.endsWith(emailDomain)) {
      return res.status(400).json({
        message: `El correo debe pertenecer al dominio ${emailDomain}`,
      });
    }

    // Verificar que el año exista en la tabla Year o crearlo si no existe
    const [yearRecord] = await Year.findOrCreate({
      where: { year: year },
      defaults: { year: year },
    });

    // Obtener el usuario del token
    const userToken = await User.findByPk(user_id);

    // Verificar si el usuario tiene acceso a la sede indicada
    if (userToken.sede_id !== parseInt(tokenSedeId, 10)) {
      return res.status(403).json({ message: "No tienes acceso a esta sede" });
    }

    // Verificar si el usuario con el email ya existe
    const userExist = await User.findOne({ where: { email } });

    if (userExist) {
      return res.status(400).json({
        message: `El usuario con el correo ${email} ya está registrado.`,
      });
    }

    // Generar una contraseña aleatoria
    const randomPassword = Math.random().toString(36).slice(-8);
    console.log(`Contraseña generada para ${email}: ${randomPassword}`);

    // Hashear la contraseña generada
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Crear el nuevo usuario (profesor)
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      carnet,
      sede_id,
      rol_id: 2, // Rol de profesor
      year_id: yearRecord.year_id,
      active: false,
    });

    // Registrar la actividad en los logs
    await logActivity(
      userToken.user_id,
      userToken.sede_id,
      userToken.name,
      "Profesor creado",
      `Creación de profesor: ${user.name}`
    );

    // Enviar correo con las credenciales al profesor
    await sendEmailCatedratico("Bienvenido a TesM", email, {
      nombre: name,
      password: randomPassword,
    });
    console.log("email: ", email, "  password: ", randomPassword);

    res.status(201).json({ message: "Profesor creado exitosamente" });
  } catch (error) {
    console.error("Error al crear el profesor:", error);
    res.status(500).json({
      message: "Error en el servidor al crear el profesor",
      error: error.message,
    });
  }
};

module.exports = {
  updateProfessorStatus,
  listProfessors,
  listActiveProfessors,
  createProfessor,
};
