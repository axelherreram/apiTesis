const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');

const initializetables = require('./config/iniciableTables');

require('dotenv').config();

const app = express();


app.use(bodyParser.json());
   
   
sequelize.sync({ alter: false, force: false  }) // , force: true  eliminar las tablas si existen
  .then(async () => {
    console.log('Base de datos sincronizada');
    await initializetables(); 
    app.listen(3000, () => {
      console.log('Servidor ejecutándose en el puerto 3000');
    });
  })
  .catch(error => {
    console.log('Error al conectar con la base de datos', error);
  }); 