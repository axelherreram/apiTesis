const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const RevisionThesis = require("./revisionThesis");
const User = require("./user");

/**
 * Model `ApprovalThesis` represents the approval of a thesis revision by a user.
 * 
 * Fields:
 * - `approval_id`: Unique identifier for the approval entry (PK, auto-increment).
 * - `revision_thesis_id`: ID of the thesis revision being approved (FK to `RevisionThesis`, required).
 * - `user_id`: ID of the user who approves the thesis revision (FK to `User`, required).
 * - `approved`: Boolean flag indicating whether the thesis is approved (default: `false`).
 * - `date_approved`: Date when the thesis was approved (nullable).
 * - `status`: The current status of the approval (`pending`, `approved`, `rejected`, or `in revision`, default: `pending`).
 * 
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: "approvalThesis"`: Database table name (`approvalThesis`).
 * 
 * Relationships:
 * - `belongsTo(RevisionThesis, { foreignKey: "revision_thesis_id" })`: An approval belongs to a thesis revision.
 * - `belongsTo(User, { foreignKey: "user_id" })`: An approval is assigned to a user.
 */
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
    tableName: "approvalthesis",
    timestamps: false,
  }
);

module.exports = ApprovalThesis;
