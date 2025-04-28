const { DataTypes } = require("sequelize");
const User = require("./user");
const { sequelize } = require("../config/database");
const Task = require("./task");

/**
 * Model `TimelineEventos` represents events related to a timeline, such as student activities or task updates.
 * 
 * Fields:
 * - `evento_id`: Unique identifier for the event (Primary Key, auto-increment).
 * - `user_id`: Reference to the user associated with the event (`User` model).
 * - `typeEvent`: Type of event (e.g., submission, comment, update).
 * - `descripcion`: Description of the event.
 * - `task_id`: Reference to the related task (`Task` model), can be null.
 * - `date`: Date when the event occurred.
 * 
 * Configuration:
 * - `timestamps: false`: No automatic `createdAt` or `updatedAt` fields.
 * - `tableName: 'TimelineEventos'`: Database table name.
 * - `hooks.beforeCreate`: Adjusts `date` to the correct timezone before saving.
 */

const TimelineEventos = sequelize.define(
  "TimelineEventos",
  {
    evento_id: {
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
    typeEvent: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Task,
        key: "task_id",
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "TimelineEventos",
    hooks: {
      beforeCreate: (timelineEvento, options) => {
        const currentDate = new Date();
        timelineEvento.date = new Date(
          currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
        );
      },
    },
  }
);

module.exports = TimelineEventos;
