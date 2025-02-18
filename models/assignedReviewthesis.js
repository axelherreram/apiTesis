const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");

const AssignedReview = sequelize.define(
  "AssignedReview",
  {
    assigned_review_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    revision_thesis_id: {
      type: DataTypes.INTEGER,
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
  },
  {
    tableName: "assignedreview",
    timestamps: false,
  }
);

module.exports = AssignedReview;
