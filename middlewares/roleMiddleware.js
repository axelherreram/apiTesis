/**
 * Middleware to verify if the user has a valid role for the requested action.
 *
 * Lee el rol directamente desde el payload del JWT (req.user.rol_id),
 * evitando una consulta a la base de datos por cada request autenticado.
 * Solo consulta la BD como fallback si el token no incluye rol_id
 * (compatibilidad con tokens emitidos antes de esta actualización).
 *
 * @param {Array} rolesPermitidos - An array of allowed role IDs.
 * @returns {Function} - Middleware function that verifies the user's role.
 */
const User = require('../models/user');

const verifyRole = (rolesPermitidos) => {
  return async (req, res, next) => {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    // ✅ Leer rol desde el JWT — sin consulta a la BD
    const rolFromToken = req.user?.rol_id;

    if (rolFromToken !== undefined && rolFromToken !== null) {
      if (!rolesPermitidos.includes(rolFromToken)) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }
      return next();
    }

    // Fallback: consulta a BD solo si el token no trae rol_id
    // (tokens emitidos antes de la actualización del login)
    try {
      const user = await User.findByPk(userId, {
        attributes: ['rol_id', 'active'],
      });

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
