const jwt = require("jsonwebtoken");

const extractSedeIdMiddleware = (req, res, next) => {
  // Obtener el token del encabezado de autorización
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado o inválido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extraer el sede_id del token y agregarlo a req
    if (decoded.user && decoded.user.sede_id) {
      req.sede_id = decoded.user.sede_id;
    } else {
      return res.status(400).json({ message: "El token no contiene un sede_id válido" });
    }
    // Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado", error: error.message });
  }
};

module.exports = extractSedeIdMiddleware;
