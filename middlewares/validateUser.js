const User = require("../models/user");

const validateUser = async (req, res, next) => {
  const { user_id } = req.body;
  const { user_id: token_user_id } = req; // Asegúrate de que este valor venga del token

  try {
    // Verificar si el usuario existe
    const userExist = await User.findByPk(user_id);
    if (!userExist) {
      return res.status(404).json({ message: "El usuario no existe" });
    }
    // Validar si el usuario del token coincide con el usuario solicitado
    if (userExist.user_id != token_user_id) {
      return res.status(401).json({ message: "No autorizado para realizar esta acción" });
    }

    next(); 
  } catch (error) {
    console.error("Error en el middleware validateUser:", error);
    res.status(500).json({
      message: "Error del servidor al validar el usuario",
      error: error.message,
    });
  }
};

module.exports = validateUser;
