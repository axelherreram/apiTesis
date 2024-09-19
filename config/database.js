const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',  // o el dialecto que estés usando
  logging: false
});

module.exports = { sequelize, Sequelize  };  // Exportamos la instancia de sequelize
