const { Op } = require("sequelize");
const Role = require("../models/roles");

/**
 * The function `listarRoles` retrieves roles with IDs 1 or 2 from a database and returns them as a
 * JSON response, handling errors appropriately.
 * @param req - The `req` parameter in the `listarRoles` function typically represents the HTTP request
 * object, which contains information about the incoming request from the client, such as headers,
 * parameters, body content, and more. It is commonly used to access data sent by the client to the
 * server.
 * @param res - The `res` parameter in the `listarRoles` function is the response object that will be
 * used to send a response back to the client making the request. It is typically used to set the
 * status code and send data back in the response.
 */
const listarRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: {
        rol_id: {
          [Op.in]: [1, 2]
        }
      }
    });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los roles", error });
  }
};

module.exports = { listarRoles };
