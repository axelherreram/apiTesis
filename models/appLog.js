const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user"); 
const Sede = require("./sede");  

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
      allowNull: false,
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
  }
);

module.exports = AppLog;
