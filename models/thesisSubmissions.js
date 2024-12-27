const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const Task = require("./task");

// Modelo para Task Submissions
const thesisSubmissions = sequelize.define(
  "thesisSubmissions",
  {
    thesisSubmissions_id: {
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
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Task,
        key: "task_id",
      },
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    approved_proposal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isIn: {
          args: [[0, 1, 2, 3]],
          msg: "El valor de 'approved_proposal' debe ser 0, 1, 2 o 3",
        },
      },
    },
  },
  {
    tableName: "thesisSubmissions",
    timestamps: false,
    hooks: {
      beforeCreate: (thesisSubmission, options) => {
        // Ajustar la fecha a la zona horaria correcta
        const currentDate = new Date();
        thesisSubmission.date = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      },
    },
  }
);

module.exports = thesisSubmissions;