const { DataTypes } = require("sequelize");
const User = require("./user");
const Sede = require("./sede");
const { sequelize } = require("../config/database");

/**
 * Model `AppLog` represents the system's activity log.
 *
 * Fields:
 * - `log_id`: Unique identifier for the log entry (PK, auto-increment).
 * - `user_id`: ID of the user who performed the action (FK to `User`, required).
 * - `sede_id`: ID of the associated location (FK to `Sede`, optional).
 * - `action`: Short description of the performed action (required).
 * - `details`: Detailed information about the action (required).
 * - `date`: Timestamp when the action occurred (required, default NOW).
 *
 * NORMALIZACIÓN 3NF:
 * - Eliminado `username` (transitivo via user_id -> user.name).
 *
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: "applog"`: Database table name (lowercase, consistente con schema).
 *
 * Hooks:
 * - `beforeCreate`: Adjusts the date to the correct timezone before saving.
 */
const AppLog = sequelize.define(
  "AppLog",
  {
    log_id: {
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
    tableName: "applog",
    hooks: {
      beforeCreate: (appLog, options) => {
        const currentDate = new Date();
        appLog.date = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      },
    },
  }
);

module.exports = AppLog;