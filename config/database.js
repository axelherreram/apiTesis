const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql', 
  logging: false,
  timezone: '-06:00', // Zona Horaria de Guatemala 
});

module.exports = { sequelize, Sequelize  };  
