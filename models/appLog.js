const { DataTypes } = require("sequelize");
const User = require("./user"); 
const Sede = require("./sede");  
const { sequelize } = require('../config/database'); 

/**
 * Model `AppLog` represents the system's activity log.
 * 
 * Fields:
 * - `log_id`: Unique identifier for the log entry (PK, auto-increment).
 * - `user_id`: ID of the user who performed the action (FK to `User`, required).
 * - `sede_id`: ID of the associated location (FK to `Sede`, optional).
 * - `username`: Name of the user who performed the action (required).
 * - `action`: Short description of the performed action (required).
 * - `details`: Detailed information about the action (required).
 * - `date`: Timestamp when the action occurred (required, default `NOW`).
 * 
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: "AppLog"`: Database table name (`BitacoraApp`).
 * 
 * Hooks:
 * - `beforeCreate`: Adjusts the date to the correct timezone before saving.
 * 
 * Relationships:
 * - `belongsTo(User, { foreignKey: "user_id" })`: A log entry belongs to a user.
 * - `belongsTo(Sede, { foreignKey: "sede_id" })`: A log entry may be associated with a location.
 */

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
    sede_id: {  
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    username: {  
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    action: {  
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    details: {  
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {  
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "AppLog",  
    hooks: {
      beforeCreate: (appLog, options) => {
        const currentDate = new Date();
        appLog.date = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      },
    },
  }
);

module.exports = AppLog;