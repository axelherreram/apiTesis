const typeTask = require("../models/typeTask");

/**
 * The function `listarTypeTask` retrieves all type tasks and sends them as a JSON response, handling
 * errors if any occur.
 * @param req - The `req` parameter in the `listarTypeTask` function typically represents the HTTP
 * request object, which contains information about the incoming request from the client, such as the
 * request headers, parameters, body, and other relevant data. This object is often used to extract
 * data sent by the client to
 * @param res - The `res` parameter in the `listarTypeTask` function is the response object that is
 * used to send a response back to the client making the request. It is typically used to set the HTTP
 * status code and send data back in the response body.
 */
const listarTypeTask = async (req, res) => {
  try {
    const typeTasks = await typeTask.findAll();
    res.status(200).json(typeTasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los typeTask", error });
  }
};

module.exports = { listarTypeTask };
