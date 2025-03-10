const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { logActivity } = require("../sql/appLog");
const path = require("path");
const fs = require("fs");
const Year = require("../models/year");
const { sendEmailPasswordRecovery } = require("../services/emailService");

/**
 * The function generates a random password of a specified length using a set of characters.
 * @param [length=10] - The `length` parameter in the `generateRandomPassword` function specifies the
 * length of the password to be generated. By default, if no length is provided, the function will
 * generate a password of length 10 characters. You can also specify a custom length when calling the
 * function to generate a password of
 * @returns A randomly generated password of the specified length containing uppercase letters,
 * lowercase letters, numbers, and special characters from the characters string.
 */
const generateRandomPassword = (length = 10) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
};

/**
 * The function `registerUser` handles the registration of a user by validating required fields,
 * checking for existing users, hashing the password, and creating a new user record in the database.
 * @param req - The `req` parameter in the `registerUser` function stands for the request object, which
 * contains information about the HTTP request made to the server. This object typically includes
 * details such as the request headers, parameters, body, URL, and more. In this specific function,
 * `req.body` is
 * @param res - The `res` parameter in the `registerUser` function is the response object that will be
 * used to send a response back to the client making the request. It is typically used to send HTTP
 * responses with status codes, headers, and data back to the client. In the provided code snippet, `
 * @returns The `registerUser` function is returning a JSON response with a success message if the user
 * registration is successful. If there are any validation errors or exceptions during the registration
 * process, appropriate error messages are returned along with the corresponding HTTP status codes.
 */
const registerUser = async (req, res) => {
  const { email, password, name, carnet, sede_id, rol_id, year } = req.body;

  // Validación de campos requeridos
  if (!email || !password || !name || !carnet || !sede_id || !rol_id || !year) {
    return res.status(400).json({
      message:
        "Faltan campos requeridos. Por favor, proporcione todos los datos necesarios.",
    });
  }

  try {
    // Obtener el año actual
    const currentYear = new Date().getFullYear();

    // Verificar si el año proporcionado es mayor al año actual
    if (year > currentYear) {
      return res.status(400).json({
        message: `No se puede crear un año mayor al actual (${currentYear}).`,
      });
    }

    // Verificar que el año exista en la tabla Year o crearlo si no existe
    const [yearRecord] = await Year.findOrCreate({
      where: { year: year },
      defaults: { year: year }, // Crea el año si no existe
    });

    // Verificar si el usuario ya está registrado
    let user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(400).json({
        message: `Ya existe un usuario registrado con el correo electrónico ${email}.`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario con el year_id del año encontrado o creado
    user = await User.create({
      email,
      password: hashedPassword,
      name,
      carnet,
      sede_id,
      rol_id,
      year_id: yearRecord.year_id, // Asociar el year_id
    });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
    });
  } catch (err) {
    console.error("Error en el registro de usuario:", err);
    res.status(500).json({
      message: "Error en el servidor. Por favor, intente más tarde.",
      error: err.message,
    });
  }
};

/**
 * The function `loginUser` is an asynchronous function that handles user login by checking the email,
 * password, and user status, then generating a JWT token for authentication.
 * @param req - The `req` parameter in the `loginUser` function is typically an object representing the
 * HTTP request. It contains information about the request made to the server, such as the request
 * headers, body, parameters, and more. In this specific function, `req.body` is used to extract the `
 * @param res - The `res` parameter in the `loginUser` function is the response object that will be
 * used to send a response back to the client making the request. It is typically used to send HTTP
 * responses with status codes, headers, and data back to the client. In the provided code snippet, the
 * @returns The `loginUser` function returns a JSON response with different messages and data based on
 * the outcome of the login process. Here is a summary of the possible return values:
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.active == false) {
      return res
        .status(401)
        .json({ message: "Acceso denegado. El usuario está deshabilitado." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña inválida" });
    }

    const token = jwt.sign(
      {
        user: {
          user_id: user.user_id,
          rol_id: user.rol_id,
          sede_id: user.sede_id,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    if (user.role_id !== 4) {
      await logActivity(
        user.user_id,
        user.sede_id,
        user.name,
        `El usuario inició sesión`,
        "Inicio de sesión"
      );
    }

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      id: user.user_id,
      sede: user.sede_id,
      rol: user.rol_id,
      passwordUpdate: user.passwordUpdate,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * The function `updatePassword` is an asynchronous function that handles updating a user's password
 * securely in a Node.js application.
 * @param req - The `req` parameter in the `updatePassword` function stands for the request object,
 * which contains information about the HTTP request made to the server. This object includes data such
 * as request headers, parameters, body, query parameters, and more.
 * @param res - The `res` parameter in the `updatePassword` function is the response object that will
 * be used to send back the response to the client making the request. It is typically used to send
 * HTTP responses with status codes, headers, and data back to the client. In this function, `res`
 * @returns The `updatePassword` function is returning different responses based on the conditions:
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Se requieren la contraseña actual y la nueva contraseña",
      });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({
        message: "La nueva contraseña no puede ser igual a la actual",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashedNewPassword, passwordUpdate: true });

    await logActivity(
      user_id,
      user.sede_id,
      user.name,
      "El usuario actualizó su contraseña",
      "Actualización de contraseña"
    );

    return res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    console.error("Error al actualizar la contraseña:", err);
    return res.status(500).json({
      message: "Error en el servidor",
      error: err.message,
    });
  }
};

/**
 * The function `updateProfilePhoto` is an asynchronous function in JavaScript that updates a user's
 * profile photo, handling cases of unauthorized access, missing photo, updating the database, and
 * logging the activity.
 * @param req - The `req` parameter in the `updateProfilePhoto` function stands for the request object.
 * It contains information about the HTTP request that triggered the function, such as headers,
 * parameters, body, and files. In this function, `req` is used to access the user ID (`req.user.user
 * @param res - The `res` parameter in the `updateProfilePhoto` function is the response object that
 * will be used to send responses back to the client making the request. It is typically used to send
 * HTTP responses with status codes, headers, and data back to the client. In this function, it is used
 * @returns The `updateProfilePhoto` function returns a JSON response with a success message if the
 * profile photo update is successful. If there are any errors during the process, it will return an
 * appropriate error message along with the status code.
 */
const updateProfilePhoto = async (req, res) => {
  const user_id = req.user ? req.user.user_id : null;
  const profilePhoto = req.file ? req.file.filename : null;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!profilePhoto) {
    return res
      .status(400)
      .json({ message: "No se proporcionó una nueva foto de perfil" });
  }

  try {
    const user = await User.findOne({ where: { user_id } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.profilePhoto) {
      const oldImagePath = path.join(
        __dirname,
        "../public/profilephoto",
        user.profilePhoto
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.log(`Error al eliminar la foto anterior: ${err.message}`);
          } else {
            console.log("Foto de perfil anterior eliminada correctamente");
          }
        });
      }
    }

    await User.update({ profilePhoto: profilePhoto }, { where: { user_id } });

    const updatedUser = await User.findOne({ where: { user_id } });

    await logActivity(
      user_id,
      updatedUser.sede_id,
      updatedUser.name,
      `El usuario actualizó su foto de perfil`,
      "Actualización de foto de perfil"
    );

    res.json({ message: "Foto de perfil actualizada exitosamente" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

/**
 * The function `requestPasswordRecovery` handles the process of generating a new random password,
 * encrypting it, updating the user's password, and sending an email with the new password for password
 * recovery.
 * @param req - The `req` parameter in the `requestPasswordRecovery` function typically represents the
 * HTTP request object, which contains information about the incoming request from the client, such as
 * headers, parameters, body, etc. In this case, it seems like you are accessing the `email` property
 * from `req
 * @param res - The `res` parameter in the `requestPasswordRecovery` function is the response object
 * that will be used to send back the response to the client making the request. It is typically used
 * to send HTTP responses with status codes, headers, and data back to the client. In this function, `
 * @returns The `requestPasswordRecovery` function returns a response based on the outcome of the
 * password recovery process. If the email is missing or not found in the database, it returns a
 * corresponding error response. If the password recovery process is successful, it sends a new
 * password to the user's email and returns a success message. If an error occurs during the process,
 * it returns a generic server error message.
 */
const requestPasswordRecovery = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Por favor, proporcione un correo electrónico." });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Correo electrónico no válido." });
    }

    // Buscar el usuario por correo electrónico
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No se encontró un usuario con ese correo electrónico." });
    }

    // Generar una nueva contraseña aleatoria
    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    await user.update({ password: hashedPassword });

    // Enviar correo con la nueva contraseña
    await sendEmailPasswordRecovery(
      "Recuperación de contraseña",
      `Tu nueva contraseña es: ${newPassword}`,
      email,
      { nombre: user.name, newPassword }
    );

    return res.status(200).json({
      message: "Tu nueva contraseña ha sido enviada a tu correo electrónico.",
    });
  } catch (error) {
    console.error("Error al solicitar la recuperación de la contraseña:", error);
    return res.status(500).json({
      message: "Error en el servidor. Por favor, intenta nuevamente más tarde.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updatePassword,
  updateProfilePhoto,
  requestPasswordRecovery,
};
