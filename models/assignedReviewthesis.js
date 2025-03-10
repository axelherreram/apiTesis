const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const RevisionThesis = require("./revisionThesis");

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
    date_assigned: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "assignedreview",
    timestamps: false,
  }
);

AssignedReview.belongsTo(RevisionThesis, { foreignKey: "revision_thesis_id" });

module.exports = AssignedReview;
