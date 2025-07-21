/**
 * Middleware to extract the `sede_id` from the JWT token.
 * 
 * This middleware checks if a JWT token is present and valid in the Authorization header of the request.
 * It extracts the `sede_id` from the decoded token and adds it to the `req` object for further use in the application.
 * If the token is missing, invalid, or doesn't contain a valid `sede_id`, it returns a 401 or 400 error.
 * Exception: Users with rol_id: 5 (coordinador de tesis general) are exempt from sede_id validation.
 * If the token is valid, it calls the next middleware or route handler.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The function to pass control to the next middleware or route handler.
 * 
 * @returns {Object} res - Returns a 401 error if the token is missing or invalid, or a 400 error if the `sede_id` is not found in the token (except for rol_id: 5).
 */

const jwt = require("jsonwebtoken");

const extractSedeIdMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado o inválido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Si el usuario tiene rol_id: 5 (coordinador de tesis general), no validar sede_id
    if (decoded.user && decoded.user.rol_id === 5) {
      req.sede_id = decoded.user.sede_id || null; // Puede ser null para coordinadores generales
      return next();
    }

    // Para otros roles, validar que sede_id esté presente
    if (decoded.user && decoded.user.sede_id) {
      req.sede_id = decoded.user.sede_id;
    } else {
      return res.status(400).json({ message: "El token no contiene un sede_id válido" });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado", error: error.message });
  }
};

module.exports = extractSedeIdMiddleware;
