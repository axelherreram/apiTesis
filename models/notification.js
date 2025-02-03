const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./user");
const Task = require("./task");

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
      type: DataTypes.STRING,
      allowNull: false,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
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
    },
    type_notif: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [["student", "teacher"]],
          msg: "El tipo de notificación debe ser 'student' o 'teacher'.",
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
