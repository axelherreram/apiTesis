const { DataTypes } = require("sequelize");
const User = require("./user"); 
const Sede = require("./sede");  
const { sequelize } = require('../config/database'); 

const AppLog = sequelize.define( 
  "AppLog",
  {
    log_id: {  // bitacora_id
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    sede_id: {  // Sede se mantiene igual
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    username: {  // usuario
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    action: {  // accion
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    details: {  // detalles
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {  // fecha
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "AppLog",  // BitacoraApp
    hooks: {
      beforeCreate: (appLog, options) => {
        // Ajustar la fecha a la zona horaria correcta
        const currentDate = new Date();
        appLog.date = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      },
    },
  }
);

module.exports = AppLog;