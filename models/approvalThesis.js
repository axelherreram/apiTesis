const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const RevisionThesis = require("./revisionThesis");
const User = require("./user");

const ApprovalThesis = sequelize.define(
  "approvalthesis",
  {
    approval_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    revision_thesis_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RevisionThesis,
        key: "revision_thesis_id",
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
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    date_approved: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "in revision"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "approvalThesis",
    timestamps: false,
  }
);

module.exports = ApprovalThesis;
