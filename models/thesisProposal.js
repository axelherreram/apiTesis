const { DataTypes } = require("sequelize");
const { sequelize } = require('../config/database'); 
const User = require("./user");
const Task = require("./task");

const thesisProposal = sequelize.define(
  "thesisProposal",
  {
    proposal_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    proposal: {
      type: DataTypes.TEXT,
      allowNull: false,
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
  },
  {
    timestamps: false,
    tableName: "thesisProposal",
  }
);

module.exports = thesisProposal;
