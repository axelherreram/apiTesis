const GroupComision = require("../models/groupComision");
const Comisiones = require("../models/comisiones");
const User = require("../models/user");
const Sede = require("../models/sede");
const Year = require("../models/year");

/**
 * The function `listUsersByGroupAndSede` retrieves and formats user data based on group and location,
 * handling errors and access control.
 * @param req - The function `listUsersByGroupAndSede` is designed to handle a request and response in
 * an Express route. It expects certain parameters in the request object, specifically `group_id` and
 * `sede_id` from the query string, and `sede_id` from the token.
 * @param res - The function `listUsersByGroupAndSede` is designed to handle a request to retrieve
 * users based on a specific group and location (sede). Here's a breakdown of the main steps performed
 * in the function:
 * @returns The function `listUsersByGroupAndSede` is returning a list of users belonging to a specific
 * group and location (sede). The function first checks if the `sede_id` extracted from the token
 * matches the `sede_id` provided in the request. If they do not match, a 403 status response is sent
 * with a message indicating lack of access.
 */

const listUsersByGroupAndSede = async (req, res) => {
  const { group_id, sede_id } = req.query;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    // Verificar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a los usuarios de esta sede" });
    }

    // Verificar que el grupo de comisión exista
    const groupComision = await GroupComision.findOne({
      where: { group_id, sede_id },
    });
    if (!groupComision) {
      return res.status(404).json({
        message: "Grupo de comisión no encontrado para la sede especificada",
      });
    }

    // Obtener todas las comisiones en el grupo especificado
    const comisiones = await Comisiones.findAll({
      where: { group_id },
      include: [
        {
          model: User,
          attributes: ["user_id", "name", "email"],  // Asegúrate de que estos campos sean correctos
        }
      ],
    });

    // Formatear la respuesta con los datos de los usuarios
    const usuarios = comisiones.map((comision) => {
      const user = comision.User; // Acceder a la relación User correctamente

      // Si existe el usuario, devolver sus datos; si no, poner los valores por defecto
      return user ? {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
      } : {
        user_id: null,
        name: "Usuario no disponible",
        email: "No disponible",
      };
    });

    // Devolver la respuesta con los usuarios
    res.status(200).json({ group_id, sede_id, usuarios });
  } catch (error) {
    console.error("Error al listar los usuarios por grupo y sede:", error);
    res.status(500).json({
      message: "Error en el servidor al listar los usuarios por grupo y sede",
      error: error.message,
    });
  }
};


/**
 * The function `listGroupBySedeAndYear` retrieves groups of commission filtered by location and year,
 * handling errors and access control.
 * @param req - The `req` parameter in the `listGroupBySedeAndYear` function represents the request
 * object, which contains information about the HTTP request made to the server. It includes data such
 * as request headers, query parameters, body content, and more. In this specific function, `req.query`
 * @param res - The function `listGroupBySedeAndYear` is an asynchronous function that takes `req` and
 * `res` as parameters. The `req` parameter is an object containing the request data, and the `res`
 * parameter is the response object used to send a response back to the client.
 * @returns The `listGroupBySedeAndYear` function is returning a list of group commissions filtered by
 * the `sede_id` and `year` provided in the request query parameters. If the `sede_id` extracted from
 * the token does not match the `sede_id` from the request, a 403 status with a message indicating lack
 * of access is returned. If the specified year or
 */
const listGroupBySedeAndYear = async (req, res) => {
  const { sede_id, year } = req.query;
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    // Verificar que el `sede_id` del token coincida con el `sede_id` de la solicitud
    if (parseInt(sede_id, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: "No tienes acceso a los grupos de esta sede" });
    }

    // Verificar que el año exista
    const yearData = await Year.findOne({ where: { year } });
    if (!yearData) {
      return res.status(404).json({ message: "Año no encontrado" });
    }
    const year_id = yearData.year_id;

    // Verificar que la sede exista
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada" });
    }

    // Obtener los grupos de comisión filtrados por sede y año
    const groups = await GroupComision.findAll({
      where: { sede_id, year_id },
    });

    res.status(200).json({ groups });
  } catch (error) {
    console.error("Error al listar los grupos de comisión:", error);
    res.status(500).json({
      message: "Error en el servidor al listar los grupos de comisión",
      error: error.message,
    });
  }
};

module.exports = {
  listUsersByGroupAndSede,
  listGroupBySedeAndYear,
};
