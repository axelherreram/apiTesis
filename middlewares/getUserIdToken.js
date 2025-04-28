/**
 * Middleware to extract the `user_id` from the JWT token and add it to the request object.
 * 
 * This middleware checks if a valid JWT token is provided in the Authorization header.
 * It decodes the token and extracts the `user_id` from it, adding it to the `req.user_id` property.
 * If the token is missing, invalid, or expired, a 401 error response is returned.
 * If the token is valid, it proceeds to the next middleware or route handler.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The function to pass control to the next middleware or route handler.
 * 
 * @returns {Object} res - Returns a 401 error if the token is missing, invalid, or expired.
 */
const jwt = require('jsonwebtoken');

const getUserIdToken = (req, res, next) => {
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

module.exports = getUserIdToken;
