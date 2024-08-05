const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuarios = require("../models/usuarios");
const { registrarBitacora } = require('../sql/bitacora');

const registerUser = async (req, res) => {
  const { email, password, nombre, carnet, sede_id, rol_id, anioRegistro } = req.body;

  try {
    let user = await Usuarios.findOne({ where: { email } });

    if (user) {
      return res.status(400).json({ message: "Usuario ya registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await Usuarios.create({
      email,
      password: hashedPassword,
      nombre,
      carnet,
      sede_id,
      rol_id,
      anioRegistro
    });
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};


const loginUser = async (req, res) => {
  const { email, password, sede_id } = req.body;

  try {
    const user = await Usuarios.findOne({ where: { email, sede_id } });

    if (!user) {
      const userExists = await Usuarios.findOne({ where: { email } });
      if (!userExists) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      return res.status(403).json({ message: 'No pertenece a esta sede' });
    }  

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { user: { user_id: user.user_id, rol_id: user.rol_id, sede_id: user.sede_id } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Scrip para registrar en la bitacora
    registrarBitacora(user.user_id, `El usuario inició sesión`, 'Inicio de sesión');

    res.status(200).json({
      message: 'Login successful',
      email: user.email,
      userName: user.nombre,
      carnet: user.carnet,
      sede: user.sede_id,
      rol: user.rol_id,
      anio: user.anioRegistro,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  


const updateUser = async (req, res) => {
  const { password } = req.body;
  const user_id = req.user ? req.user.user_id : null; 

  if (!password) {
    return res.status(400).json({ message: 'Nueva contraseña requerida' });
  }

  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    
    await Usuarios.update({ password: hashedPassword }, { where: { user_id } });
    
    // Scrip para registrar en la bitacora
    await registrarBitacora(user_id, `El usuario actualizo su contraseña`, 'Actualización de contraseña');

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

  

module.exports = {
  registerUser,
  loginUser,
  updateUser,
};
