const fs = require("fs");
const User = require("../models/user"); // Asegúrate de que la ruta al modelo User sea correcta

const validateUser = async (req, res, next) => {
  const { user_id } = req.body;
  const token_user_id = req.user_id;


  try {
    const userExist = await User.findByPk(user_id);
    if (!userExist) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "User does not exist" });
    }


    if (userExist.user_id !== token_user_id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(401).json({ message: "No tienes autorización para realizar esta acción" });
    }

    next();
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      message: "Server error while validating user",
      error: error.message,
    });
  }
};
module.exports = validateUser;