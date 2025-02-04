const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./user");
const Task = require("./task");
const Sede = require("./sede");

const notification = sequelize.define(
  "notification",
  {
    notification_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    notification_text: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "user_id",
      },
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Task,
        key: "task_id",
      },
    },
    notification_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    
    type_notification: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: {
          args: [["student", "general"]],
          msg: "El tipo de notificación debe ser 'student' o 'general'.",
        },
      },
    },
  },
  {
    tableName: "notification",
    timestamps: false,
  }
);

module.exports = notification;
