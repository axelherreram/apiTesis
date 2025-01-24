const Sede = require("../models/sede");
const User = require("../models/user");

/**
 * The function `listSede` retrieves all locations from the database and returns them as a JSON
 * response, handling errors appropriately.
 * @param req - The `req` parameter in the `listSede` function typically represents the HTTP request
 * object, which contains information about the incoming request from the client, such as headers,
 * parameters, body, etc. It is commonly used to access data sent by the client to the server.
 * @param res - The `res` parameter in the `listSede` function is the response object that is used to
 * send a response back to the client making the request. It is typically provided by the Express
 * framework in Node.js and allows you to send HTTP responses with status codes, headers, and data back
 * to
 */
const listSede = async (req, res) => {
  try {
    const locations = await Sede.findAll();
    res.status(200).json(locations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las sedes", error: error });
  }
};

/**
 * The function `createSede` is an asynchronous function in JavaScript that creates a new "sede"
 * (location) based on the provided name, checks for existing duplicates, and associates it with a user
 * ID.
 * @param req - The `req` parameter in the `createSede` function stands for the request object. It
 * contains information about the HTTP request that triggered the function, such as request headers,
 * parameters, body, and more. In this case, the function is expecting `req.body` to contain the `name
 * @param res - The `res` parameter in the `createSede` function is the response object that will be
 * used to send the response back to the client making the request. It is typically used to set the
 * status code, send JSON data, or handle errors when creating a new "sede" (location
 * @returns If the `nameSede` is missing in the request body, a 400 status response with a message "El
 * nombre de la sede es necesario" will be returned. If the `nameSede` already exists in the database,
 * a 409 status response with a message "La sede '' ya existe" will be returned. If the
 * creation of the new sede is successful
 */
const createSede = async (req, res) => {
  try {
    const { nameSede } = req.body;
    const user_id = req.user_id;

    if (!nameSede) {
      return res
        .status(400)
        .json({ message: "El nombre de la sede es necesario" });
    }

    // Verificar si la sede ya existe
    const existingSede = await Sede.findOne({ where: { nameSede } });
    if (existingSede) {
      return res
        .status(409)
        .json({ message: `La sede '${nameSede}' ya existe` });
    }

    const user = await User.findByPk(user_id);

    // Crear la nueva sede
    await Sede.create({ nameSede });

    res.status(201).json({ message: "Sede creada satisfactoriamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la sede", error });
  }
};

/**
 * The function `editSede` updates the name of a specific location (sede) based on the provided
 * parameters.
 * @param req - The `req` parameter in the `editSede` function stands for the request object. It
 * contains information about the HTTP request that triggered the function, such as request headers,
 * parameters, body, and more. In this function, `req` is used to extract the `sede_id`
 * @param res - The `res` parameter in the `editSede` function is the response object that will be used
 * to send a response back to the client making the request. It is typically used to set the status
 * code, send data, or handle errors in the response.
 * @returns If the `nameSede` is not provided in the request body, a 400 status with a message "El
 * nombre de la sede es necesario" will be returned. If the specified `sede_id` does not correspond to
 * any existing sede, a 404 status with a message "Sede no encontrada" will be returned. If the update
 * is successful, a 200 status with
 */
const editSede = async (req, res) => {
  try {
    const { sede_id } = req.params;
    const { nameSede } = req.body;

    if (!nameSede) {
      return res
        .status(400)
        .json({ message: "El nombre de la sede es necesario" });
    }

    // Verificar si la sede existe
    const sede = await Sede.findByPk(sede_id);
    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada" });
    }

    // Actualizar el nombre de la sede
    sede.nameSede = nameSede;
    await sede.save();

    res.status(200).json({ message: "Sede actualizada satisfactoriamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la sede", error });
  }
};

module.exports = { listSede, createSede, editSede };