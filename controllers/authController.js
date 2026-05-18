const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { logActivity } = require("../sql/appLog");
const path = require("path");
const fs = require("fs");
const Year = require("../models/year");
const { sendEmailPasswordRecovery } = require("../services/emailService");
const crypto = require("crypto");


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
  let { email, password, name, carnet, sede_id, rol_id, year } = req.body;

  // Limpiar sede_id: convertir string vacío a null
  if (sede_id === "" || sede_id === "null" || sede_id === "undefined") {
    sede_id = null;
  }

  // Validación de campos requeridos
  if (!email || !password || !name || !carnet || !rol_id || !year) {
    return res.status(400).json({
      message:
        "Faltan campos requeridos. Por favor, proporcione todos los datos necesarios.",
    });
  }

  // Validación adicional de tipos de datos
  // sede_id puede ser null, pero si se proporciona debe ser un número válido
  if (sede_id !== null && sede_id !== undefined && sede_id !== "" && (isNaN(sede_id) || sede_id <= 0)) {
    return res.status(400).json({
      message: "sede_id debe ser un número válido mayor a 0 o null.",
    });
  }

  if (isNaN(rol_id) || rol_id <= 0) {
    return res.status(400).json({
      message: "rol_id debe ser un número válido mayor a 0.",
    });
  }

  if (isNaN(year) || year <= 0) {
    return res.status(400).json({
      message: "year debe ser un número válido mayor a 0.",
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
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      message: "Error en el servidor. Por favor, intente más tarde.",
      ...(isDev && { error: err.message }),
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
    // Search for the user by email
    const user = await User.findOne({ where: { email } });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Check if the user is active
    if (user.active == false) {
      return res
        .status(401)
        .json({ message: "Acceso denegado. El usuario está deshabilitado." });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña inválida" });
    }

    const payload = {
      user: {
        user_id: user.user_id,
        rol_id: user.rol_id,
        sede_id: user.sede_id,
      },
    };

    // Access token: corta duración (1h)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Refresh token: larga duración (7 días), firmado con secret diferente
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
      { expiresIn: "7d" }
    );

    // Log activity only for role 1
    if (user.rol_id === 1) {
      await logActivity(
        user.user_id,
        user.sede_id,
        `El usuario inició sesión`,
        "Inicio de sesión"
      );
    }

    // ✅ refreshToken como cookie HttpOnly — JavaScript nunca puede leerla (protección XSS)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,                                          // inaccesible desde JS
      secure: process.env.NODE_ENV === 'production',          // solo HTTPS en producción
      sameSite: 'lax',                                        // protección CSRF básica
      maxAge: 7 * 24 * 60 * 60 * 1000,                       // 7 días en ms
      path: '/',
    });

    // Send response — accessToken en body (puede ir en memoria en el frontend)
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      id: user.user_id,
      sede: user.sede_id,
      rol: user.rol_id,
      passwordUpdate: user.passwordUpdate,
      token,
      // refreshToken ya NO va en el body — viaja solo como cookie HttpOnly
    });
  } catch (error) {
    console.error('Error en loginUser:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({ message: 'Error en el servidor. Por favor intente más tarde.', ...(isDev && { error: error.message }) });
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
  // Mensaje genérico invariable — no revela si el correo existe (evita user enumeration)
  const GENERIC_MSG = "Si el correo electrónico está registrado, recibirás tu nueva contraseña en unos minutos.";

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

    // Buscar el usuario — si no existe, responder igual que si existiera (sin revelar)
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Respuesta 200 genérica: no confirmamos ni negamos si el correo existe
      return res.status(200).json({ message: GENERIC_MSG });
    }

    // Generar nueva contraseña aleatoria
    const newPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    await user.update({ password: hashedPassword, passwordUpdate: false });

    // Enviar correo con la nueva contraseña
    await sendEmailPasswordRecovery(
      "Recuperación de contraseña",
      `Tu nueva contraseña es: ${newPassword}`,
      email,
      { nombre: user.name, newPassword }
    );

    return res.status(200).json({ message: GENERIC_MSG });
  } catch (error) {
    console.error("Error al solicitar la recuperación de la contraseña:", error);
    return res.status(500).json({
      message: "Error en el servidor. Por favor, intenta nuevamente más tarde.",
      error: error.message,
    });
  }
};

/**
 * Renueva el access token leyendo el refresh token desde la cookie HttpOnly.
 * El cliente NO necesita enviar nada en el body — la cookie viaja automáticamente.
 */
const refreshAccessToken = async (req, res) => {
  // Leer desde cookie HttpOnly (no desde body — más seguro)
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No hay refresh token. Por favor inicia sesión nuevamente." });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh"
    );

    // Verificar que el usuario sigue activo
    const user = await User.findByPk(decoded.user.user_id);
    if (!user || !user.active) {
      return res.status(401).json({ message: "Usuario inactivo o no encontrado." });
    }

    // Emitir nuevo access token
    const newToken = jwt.sign(
      { user: { user_id: user.user_id, rol_id: user.rol_id, sede_id: user.sede_id } },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token: newToken });
  } catch (error) {
    return res.status(401).json({ message: "Refresh token inválido o expirado." });
  }
};

/**
 * Cierra la sesión del usuario limpiando la cookie del refresh token en el servidor.
 */
const logoutUser = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
};

module.exports = {
  registerUser,
  loginUser,
  updatePassword,
  updateProfilePhoto,
  requestPasswordRecovery,
  refreshAccessToken,
  logoutUser,
};
