/**
 * Middleware to verify if the user has a valid role for the requested action.
 * 
 * This middleware checks if the user is authorized based on their `rol_id` (role ID).
 * It retrieves the user from the database using the `user_id` provided in the request (from the JWT token).
 * The `rolesPermitidos` argument is an array of allowed role IDs.
 * If the user does not exist or does not have one of the allowed roles, a 403 or 401 error response is returned.
 * If the user is valid and has the correct role, the middleware proceeds to the next handler.
 * 
 * @param {Array} rolesPermitidos - An array of allowed role IDs.
 * @returns {Function} - Middleware function that verifies the user's role.
 * 
 * @throws {Object} res - Returns a 401 error if no `user_id` is provided, a 404 error if the user is not found,
 *                        a 403 error if the user does not have one of the allowed roles, and a 500 error if there is a server issue.
 */
const User = require('../models/user');

const verifyRole = (rolesPermitidos) => {
  return async (req, res, next) => {
    const userId = req.user ? req.user.user_id : null;

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (!rolesPermitidos.includes(user.rol_id)) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor' });
    }
  };
};

module.exports = verifyRole;
