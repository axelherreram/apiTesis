const AppLog = require("../models/appLog");
const Roles = require("../models/roles");
const User = require("../models/user");

/**
 * The function `listAllLogs` retrieves and formats log entries for a specific location, ensuring
 * permission and handling errors appropriately.
 * @param req - The `req` parameter in the `listAllLogs` function represents the request object in
 * Node.js. It contains information about the HTTP request made to the server, including headers,
 * parameters, body, etc. In this function, `req` is used to extract the `sede_id` from
 * @param res - The `res` parameter in the `listAllLogs` function is the response object that will be
 * used to send a response back to the client making the request. It is typically used to send HTTP
 * responses with status codes, headers, and data back to the client. In the provided code snippet,
 * @returns The function `listAllLogs` is returning a JSON response with the following structure:
 * - If the requestSedeId does not match the tokenSedeId, a 403 status with a message indicating lack
 * of permission is returned.
 * - If there are no logs found for the given sede_id, a 404 status with a message indicating no logs
 * found is returned.
 * - If there are logs found
 */
const listAllLogs = async (req, res) => {
  const { sede_id: requestSedeId } = req.params; // Sede desde el parámetro de la solicitud
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    // Validar si la sede del token coincide con la sede de la solicitud
    if (parseInt(requestSedeId, 10) !== parseInt(tokenSedeId, 10)) {
      return res.status(403).json({
        message: "No tienes permiso para acceder a los registros de esta sede.",
      });
    }

    const logs = await AppLog.findAndCountAll({
      where: { sede_id: requestSedeId },
      include: [
        {
          model: User,
          attributes: ["name", "rol_id"],
          include: [
            {
              model: Roles,
              as: "role",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["date", "DESC"]],
    });

    if (!logs || logs.length === 0) {
      return res.status(404).json({
        message: "No se encontraron entradas de bitácora para esta sede.",
      });
    }

    // Formatear logs
    const formattedLogs = logs.rows.map((log) => ({
      user_id: log.user_id,
      username: log.user ? log.user.name : "Usuario desconocido",
      role: log.user?.role ? log.user.role.name : "Rol desconocido",
      action: log.action,
      description: log.details,
      date: log.date,
    }));

    res.json({
      message: "Lista completa de bitácoras",
      logs: formattedLogs,
    });
  } catch (err) {
    console.error("Error al listar todas las bitácoras:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/**
 * The function `listLogsByUser` retrieves and formats logs for a specific user, handling error cases
 * appropriately.
 * @param req - The `req` parameter in the `listLogsByUser` function stands for the request object,
 * which contains information about the HTTP request that triggered the function. This object typically
 * includes details such as the request headers, parameters, body, and other relevant data sent by the
 * client to the server. In
 * @param res - The `res` parameter in the `listLogsByUser` function is the response object that will
 * be used to send a response back to the client making the request. It is typically used to send HTTP
 * responses with data or error messages.
 * @returns The `listLogsByUser` function returns a list of logs for a specific user. If the user is
 * not found or if there are no logs for the user, appropriate error messages are returned. If there
 * are logs found for the user, they are formatted and returned in the response along with a success
 * message. In case of any errors during the process, a generic server error message is returned.
 */
const listLogsByUser = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const user = await User.findOne({ where: { user_id } });
    if (!user) {
      return res.status(404).json({ message: "No se encontró el usuario" });
    }

    const logs = await AppLog.findAll({
      where: { user_id },
      order: [["date", "DESC"]],
    });

    if (!logs || logs.length === 0) {
      return res.status(404).json({
        message: "No se encontraron entradas de bitácora para este usuario",
      });
    }

    const formattedLogs = logs.map((log) => ({
      username: log.username,
      action: log.action,
      description: log.details,
      date: log.date,
    }));

    res.json({
      message: "Lista de bitácoras",
      logs: formattedLogs,
    });
  } catch (err) {
    console.error("Error al listar las bitácoras:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = { listAllLogs, listLogsByUser };
