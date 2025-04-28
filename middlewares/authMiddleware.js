/**
 * Authentication middleware to verify the JWT token.
 * 
 * This middleware checks if a JWT token is present in the Authorization header of the request.
 * If the token is valid, it decodes the user information and attaches it to `req.user`.
 * The request will then proceed to the next middleware or route handler.
 * If the token is missing or invalid, it returns a 401 Unauthorized error.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The function to pass control to the next middleware or route handler.
 * 
 * @returns {Object} res - Returns a 401 error if the token is missing or invalid.
 */

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; 
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
