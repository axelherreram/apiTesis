// middlewares/roleMiddleware.js
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
