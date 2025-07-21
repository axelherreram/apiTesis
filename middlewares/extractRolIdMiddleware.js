const jwt = require('jsonwebtoken');

const extractRolIdMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // No token provided
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Invalid token
    }
    // Assuming rol_id is in the token payload nested under 'user'
    req.rol_id = user.user.rol_id; // Access the nested rol_id
    next();
  });
};

module.exports = extractRolIdMiddleware; 