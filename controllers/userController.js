const User = require("../models/user");
const { logActivity } = require("../sql/appLog");
const CourseAssignment = require("../models/courseAssignment");
const { Op } = require("sequelize");
const Course = require("../models/course");
const Year = require("../models/year");
const Roles = require("../models/roles");
const bcrypt = require("bcrypt");
const Sede = require("../models/sede");
const { sendEmailPassword } = require("./emailController");
const CourseSedeAssignment = require("../models/courseSedeAssignment");

/**
 * The function `getUsersByCourse` retrieves users assigned to a specific course for a given year and
 * location, handling various validations and returning formatted user data along with course
 * information.
 * @param req - req: {
 * @param res - The function `getUsersByCourse` is an asynchronous function that retrieves users
 * assigned to a specific course based on the provided parameters. It handles various checks and
 * validations before fetching the users and formatting the response.
 * @returns The function `getUsersByCourse` returns a list of users assigned to a specific course for a
 * given year and location. The response includes the count of users and an array of formatted user
 * objects containing user information such as user_id, email, userName, profilePhoto, and carnet. If
 * any errors occur during the process, an error message is returned along with a status code of 500.
 */
const getUsersByCourse = async (req, res) => {
  const { sede_id, course_id, year } = req.params;
  const user_id = req.user_id;
  const { sede_id: tokenSedeId } = req;
  try {
    // Verificar si el año existe

    // Validar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a los grupos de esta sede" });
    }

    const yearRecord = await Year.findOne({ where: { year } });
    if (!yearRecord) {
      return res.status(404).json({ message: "El año especificado no existe" });
    }
    const year_id = yearRecord.year_id;

    // Obtener el asigCourse_id con base en course_id y year_id
    const courseSedeAssignment = await CourseSedeAssignment.findOne({
      where: { course_id, year_id, sede_id },
    });

    if (!courseSedeAssignment) {
      return res.status(404).json({
        message:
          "No se encontró una asignación para el curso, año y sede especificados",
      });
    }
    const asigCourse_id = courseSedeAssignment.asigCourse_id;

    // Obtener usuarios asignados al curso
    const users = await CourseAssignment.findAll({
      where: { asigCourse_id },
      include: [
        {
          model: User,
          attributes: [
            "user_id",
            "email",
            "name",
            "carnet",
            "sede_id",
            "rol_id",
            "profilePhoto",
          ],
        },
      ],
    });

    if (users.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron usuarios asignados a este curso para el año y sede especificados",
      });
    }

    // Formatear usuarios para la respuesta
    const formattedUsers = users.map((assignment) => {
      const user = assignment.User;
      return {
        user_id: user.user_id,
        email: user.email,
        userName: user.name,
        profilePhoto: user.profilePhoto
          ? `${process.env.BASE_URL}/public/profilephoto/${user.profilePhoto}`
          : null,
        carnet: user.carnet,
      };
    });

    // Obtener información del curso
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

    /*     // Registrar actividad
    await logActivity(
      user_id,
      requestingUser.sede_id,
      requestingUser.name,
      "Listar estudiantes",
      `Listó todos los estudiantes del curso: ${course.courseName}`
    ); */

    res.status(200).json({
      countUsers: users.length,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error al obtener usuarios asignados:", error);
    res.status(500).json({
      message: "Error al obtener los usuarios asignados al curso",
      error: error.message,
    });
  }
};

/**
 * The function `listuserbytoken` retrieves user information based on a token and returns a formatted
 * user object or an error message.
 * @param req - The `req` parameter in the `listuserbytoken` function is typically an object
 * representing the HTTP request. It contains information about the request made to the server, such as
 * headers, body, parameters, and user authentication details. In this specific function, `req.user_id`
 * is used to
 * @param res - The `res` parameter in the `listuserbytoken` function is the response object that will
 * be used to send a response back to the client making the request. It is typically used to send HTTP
 * responses with data or error messages. In the provided code snippet, `res` is used to
 * @returns The `listuserbytoken` function returns a JSON response with the formatted user data if the
 * user is found, or a 404 status with a message "Usuario no encontrado" if the user is not found. If
 * there is an error during the process, it returns a 500 status with a message "Error al obtener el
 * usuario" and the error message.
 */
const listuserbytoken = async (req, res) => {
  const user_id = req.user_id;

  try {
    const user = await User.findOne({
      where: { user_id },
      include: [{ model: Roles, as: "role", attributes: ["name"] }],
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const sede = await Sede.findByPk(user.sede_id);

    const formattedUser = {
      user_id: user.user_id,
      email: user.email,
      userName: user.name,
      profilePhoto: user.profilePhoto
        ? `${process.env.BASE_URL}/public/profilephoto/${user.profilePhoto}`
        : null,
      carnet: user.carnet,
      sede: user.sede_id,
      NombreSede: sede.nameSede,
      registrationYear: user.registrationYear,
      roleName: user.rol_id ? user.role.name : null,
    };

    res.status(200).json(formattedUser);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el usuario",
      error: error.message,
    });
  }
};

/**
 * The function generates a random password consisting of uppercase letters, lowercase letters,
 * numbers, and special characters.
 * @returns A randomly generated password consisting of a combination of uppercase letters, lowercase
 * letters, numbers, and special characters.
 */
const generateRandomPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * The function `createAdmin` registers a new administrator user, ensuring email uniqueness, 
 * role limitations per location, and secure password handling.
 * @param req - The `req` parameter in the `createAdmin` function represents the HTTP request 
 * object containing user input such as `email`, `name`, `carnet`, and `sede_id`. These values 
 * are extracted from the request body for validation and processing.
 * @param res - The `res` parameter in the `createAdmin` function represents the HTTP response 
 * object used to send responses back to the client. It returns appropriate status codes and 
 * messages based on the success or failure of the administrator creation process.
 * @returns The `createAdmin` function returns a JSON response. If successful, it returns a 
 * 201 status with a message confirming the administrator's creation. If validation fails 
 * or an error occurs, it returns a relevant status code (400, 404, or 500) with an 
 * appropriate error message.
 */
const createAdmin = async (req, res) => {
  const { email, name, carnet, sede_id } = req.body;

  // Validar campos requeridos
  if (!email || !name || !carnet || !sede_id) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios." });
  }
  
    // Validar formato del código (carnet)
    if (carnet) {
      const carnetRegex = /^\d{4}-\d{2}-\d{4,8}$/; // Ejemplo válido: 2024-01-1234
      if (!carnetRegex.test(carnet)) {
        return res.status(400).json({
          title: "Error",
          message: "Carnet inválido, ingrese codigo completo",
        });
      }
    }
  try {
    // Validar dominio del correo
    if (!email.endsWith("@miumg.edu.gt")) {
      return res.status(400).json({
        message: "El correo debe tener el dominio @miumg.edu.gt.",
      });
    }

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    // Verificar si la sede existe
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res
        .status(404)
        .json({ message: "La sede especificada no existe." });
    }

    // Validar que no haya más de 3 administradores por sede
    const adminCount = await User.count({
      where: {
        rol_id: 3, // Rol de administrador
        sede_id,
      },
    });

    if (adminCount >= 2) {
      return res.status(400).json({
        message:
          "Ya existen 2 administradores en esta sede. No se puede agregar más.",
      });
    }

    // Generar contraseña aleatoria
    const password = generateRandomPassword();

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Obtener o crear el año actual
    const currentYear = new Date().getFullYear();
    const [yearRecord] = await Year.findOrCreate({
      where: { year: currentYear },
    });
    
    // Enviar correo electrónico con la contraseña temporal
    const templateVariables = {
      nombre: name,
      password: password,
    };

/*     await sendEmailPassword(
      "Registro exitoso",
      `Hola ${name}, tu contraseña temporal es: ${password}`,
      email,
      templateVariables
    );
 */
    // Crear el administrador
    const admin = await User.create({
      email,
      name,
      carnet,
      sede_id,
      password: hashedPassword,
      rol_id: 3, // Rol de administrador
      year_id: yearRecord.year_id,
    });

    console.log("Administrador creado:", admin.email, "password", password);
    res.status(201).json({
      message: "Administrador creado con éxito.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Ocurrió un error al crear el administrador." });
  }
};

/**
 * The function `removeAdmin` removes an administrator role from a user, ensuring that at 
 * least one administrator remains per location.
 * @param req - The `req` parameter in the `removeAdmin` function represents the HTTP request 
 * object containing `user_id` and `sede_id` in the request body. These values are used to 
 * identify and validate the administrator being removed.
 * @param res - The `res` parameter in the `removeAdmin` function represents the HTTP response 
 * object used to send responses back to the client. It returns appropriate status codes and 
 * messages based on the success or failure of the administrator removal process.
 * @returns The `removeAdmin` function returns a JSON response. If successful, it returns a 
 * 200 status with a confirmation message. If validation fails or an error occurs, it returns 
 * a relevant status code (400, 404, or 500) with an appropriate error message.
 */
const removeAdmin = async (req, res) => {
  const { user_id, sede_id } = req.body;

  // Validar campos requeridos
  if (!user_id || !sede_id) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios." });
  }

  try {
    // Verificar si el usuario existe y es un administrador
    const user = await User.findOne({ where: { user_id, rol_id: 3, sede_id } });
    if (!user) {
      return res.status(404).json({
        message: "El usuario no es un administrador de esta sede o no existe.",
      });
    }

    // Verificar si el usuario es el único administrador de la sede
    const adminCount = await User.count({
      where: {
        rol_id: 3,
        sede_id,
      },
    });

    if (adminCount <= 1) {
      return res.status(400).json({
        message: "No se puede eliminar al único administrador de esta sede.",
      });
    }

    // Eliminar el usuario como administrador de la sede y le asigna el rol de catedratico
    await user.update({ rol_id: 2 });

    res.status(200).json({
      message: "Administrador eliminado exitosamente.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Ocurrió un error al eliminar al administrador." });
  }
};

/**
 * The function `listAllAdmins` retrieves and returns a list of all administrators, 
 * including their details and associated locations.
 * @param req - The `req` parameter in the `listAllAdmins` function represents the HTTP 
 * request object. Although not directly used, it may contain authentication details or 
 * filters in future implementations.
 * @param res - The `res` parameter in the `listAllAdmins` function represents the HTTP 
 * response object used to send a response back to the client. It returns the list of 
 * administrators or an error message if no administrators are found or an internal error occurs.
 * @returns The `listAllAdmins` function returns a JSON response. If successful, it returns 
 * a 200 status with a list of administrators. If no administrators are found, it returns 
 * a 404 status with a corresponding message. In case of an error, it returns a 500 status 
 * with an error message.
 */
const listAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { rol_id: 3 },
      include: [
        {
          model: Sede,
          as: "location",
          attributes: ["sede_id", "nameSede"],
        },
      ],
      attributes: ["user_id", "email", "name", "carnet", "profilePhoto"],
    });

    // Verificar si hay administradores
    if (admins.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron administradores." });
    }

    // Formatear respuesta
    const formattedAdmins = admins.map((admin) => ({
      user_id: admin.user_id,
      email: admin.email,
      name: admin.name,
      carnet: admin.carnet,
      sede: admin.location
        ? {
            sede_id: admin.location.sede_id,
            nombre: admin.location.nameSede,
          }
        : null, // Sede del administrador
      profilePhoto: admin.profilePhoto
        ? `${process.env.BASE_URL}/public/profilephoto/${admin.profilePhoto}`
        : null,
    }));

    res.status(200).json({
      message: "Administradores listados con éxito.",
      admins: formattedAdmins,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ocurrió un error al listar los administradores.",
      error: error.message,
    });
  }
};

/**
 * The function `assignAdminToSede` assigns an existing administrator to a specific 
 * location (sede) after validating the required conditions.
 * @param req - The `req` parameter in the `assignAdminToSede` function represents the HTTP 
 * request object containing the `user_id` and `sede_id` in the request body.
 * @param res - The `res` parameter in the `assignAdminToSede` function represents the HTTP 
 * response object used to send a response back to the client, indicating success or failure.
 * @returns The `assignAdminToSede` function returns a JSON response. If successful, it 
 * returns a 200 status confirming the administrator was assigned. If the sede or user 
 * does not exist, it returns a 404 status. If the maximum number of administrators is 
 * reached, it returns a 400 status. In case of an error, it returns a 500 status with 
 * an error message.
 */

const assignAdminToSede = async (req, res) => {
  const { user_id, sede_id } = req.body;

  // Validar campos requeridos
  if (!user_id || !sede_id) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios." });
  }

  try {
    // Verificar si la sede existe
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res
        .status(404)
        .json({ message: "La sede especificada no existe." });
    }

    // Verificar si el usuario existe y tiene el rol de administrador
    const user = await User.findOne({ where: { user_id, rol_id: 3 } });
    if (!user) {
      return res.status(404).json({
        message: "El usuario no existe o no tiene el rol de administrador.",
      });
    }

    // Validar que no haya más de 3 administradores en la sede
    const adminCount = await User.count({
      where: {
        rol_id: 3, // Rol de administrador
        sede_id,
      },
    });

    if (adminCount >= 2) {
      return res.status(400).json({
        message:
          "Ya existen 2 administradores en esta sede. No se puede asignar más.",
      });
    }

    // Asignar el usuario como administrador a la sede
    await user.update({ rol_id: 3 });

    res.status(200).json({
      message: "Administrador asignado a la sede con éxito.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ocurrió un error al asignar al administrador.",
      error: error.message,
    });
  }
};

module.exports = {
  getUsersByCourse,
  listuserbytoken,
  createAdmin,
  removeAdmin,
  listAllAdmins,
  assignAdminToSede,
};
