const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'dbsistemdocs',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
    timezone: '-06:00',
  },
  test: {
    username: process.env.DB_USER_TEST || 'root',
    password: process.env.DB_PASS_TEST || '',
    database: process.env.DB_NAME_TEST || 'database_test',
    host: process.env.DB_HOST_TEST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
    timezone: '-06:00',
  },
  production: {
    username: process.env.DB_USER_PROD || 'root',
    password: process.env.DB_PASS_PROD || '',
    database: process.env.DB_NAME_PROD || 'database_production',
    host: process.env.DB_HOST_PROD || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
    timezone: '-06:00',
  }
};

const sequelize = new Sequelize(
  config[env].database,
  config[env].username,
  config[env].password,
  {
    host: config[env].host,
    dialect: config[env].dialect,
    logging: config[env].logging,
    timezone: config[env].timezone,
  }
);

module.exports = { sequelize, Sequelize, config };
