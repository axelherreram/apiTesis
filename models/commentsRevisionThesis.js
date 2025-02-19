const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const AssignedReview = require("./assignedReviewthesis");

const commentsRevision = sequelize.define(
  "commentsRevision",
  {
    commentsRevision_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    assigned_review_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: AssignedReview,
        key: "assigned_review_id",
      },
    },
    title: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date_comment: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "commentsRevision",
    timestamps: false,
  }
);

module.exports = commentsRevision;
