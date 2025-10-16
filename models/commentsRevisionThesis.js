const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const AssignedReview = require("./assignedReviewthesis");
const RevisionThesis = require("./revisionThesis");

/**
 * Model `commentsRevision` represents the comments made on a thesis revision by a reviewer.
 * 
 * Fields:
 * - `commentsRevision_id`: Unique identifier for the comment entry (PK, auto-increment).
 * - `assigned_review_id`: ID of the assigned review associated with the comment (FK to `AssignedReview`, required).
 * - `title`: Title of the comment (required).
 * - `comment`: The content of the comment (required).
 * - `date_comment`: Date when the comment was made (nullable, default: current date).
 * 
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: "commentsRevision"`: Database table name (`commentsRevision`).
 * 
 * Relationships:
 * - `belongsTo(AssignedReview, { foreignKey: "assigned_review_id" })`: A comment belongs to an assigned review.
 */
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
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date_comment: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "commentsrevision",
    timestamps: false,
  }
);

module.exports = commentsRevision;
