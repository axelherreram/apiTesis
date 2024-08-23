const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const Usuarios = require('../models/usuarios');
const path = require('path');
const fs = require('fs'); // Asegúrate de importar el módulo fs

const cargarTernasMasivas = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Se requiere un archivo Excel para la carga masiva' });
    }

    const filePath = path.join(__dirname, '../public/uploads/excels', req.file.filename);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const usuariosData = xlsx.utils.sheet_to_json(sheet);
    
    const sede_id = req.body.sede_id; 
    const anioRegistro = new Date().getFullYear(); 
    const rol_id = 2;  // Rol fijo para ternas (ID = 2)

    for (const usuario of usuariosData) {
      const { email, nombre } = usuario;

      let user = await Usuarios.findOne({ where: { email } });

      if (!user) {
        // Generar una contraseña aleatoria
        const passwordAleatoria = Math.random().toString(36).slice(-8);
        console.log(`Contraseña generada para ${email}: ${passwordAleatoria}`);
  
        const hashedPassword = await bcrypt.hash(passwordAleatoria, 10);

        // Crear un nuevo usuario en la base de datos con rol de terna
        user = await Usuarios.create({
          email,
          password: hashedPassword,
          nombre,
          rol_id,
          sede_id,
          anioRegistro,
        });
      }
    }

    // Eliminar el archivo Excel después de completar la carga
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error al eliminar el archivo Excel: ${err.message}`);
      } else {
        console.log('Archivo Excel eliminado correctamente');
      }
    });

    res.status(201).json({ message: 'Ternas cargadas exitosamente' });
  } catch (error) {
    console.error('Error al cargar ternas:', error);

    // Eliminar el archivo Excel en caso de error
    if (req.file) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error al eliminar el archivo Excel: ${err.message}`);
        }
      });
    }

    res.status(500).json({ message: 'Error al cargar ternas', error: error.message });
  }
};

module.exports = {
  cargarTernasMasivas,
};
