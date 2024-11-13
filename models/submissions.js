const { DataTypes } = require("sequelize");
const Task = require("./task");
const User = require("./user");
const { sequelize } = require("../config/database");

const Submissions = sequelize.define(
  "Submissions",
  {
    submission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    directory: {
      type: DataTypes.STRING(255),
      allowNull: false, // Ruta del PDF de las propuestas
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Task,
        key: "task_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    submission_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    approved_proposal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 3,
      },
    },
  },
  {
    timestamps: false,
    tableName: "Submissions",
  }
);

module.exports = Submissions;
