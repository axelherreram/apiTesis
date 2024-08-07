const jwt = require('jsonwebtoken');

const obtenerUserIdDeToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado, token faltante o inválido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user_id = decoded.user.user_id; 
    next();
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado, token inválido' });
  }
};

module.exports = obtenerUserIdDeToken;
