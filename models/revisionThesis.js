const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const Sede = require("./sede");
const moment = require("moment-timezone");

/**
 * Model `RevisionThesis` represents the thesis revision process, including the user and sede assigned to the revision.
 * 
 * Fields:
 * - `revision_thesis_id`: Unique identifier for the thesis revision entry (PK, auto-increment).
 * - `user_id`: ID of the user assigned to the thesis revision (FK to `User`, required).
 * - `sede_id`: ID of the sede (location) associated with the thesis revision (FK to `Sede`, required).
 * - `active_process`: Boolean flag indicating whether the revision process is active (default: `true`).
 * - `date_revision`: Date when the thesis revision started (nullable, default: current date).
 * - `approval_letter_dir`: Directory path for the thesis approval letter (nullable).
 * - `thesis_dir`: Directory path for the thesis document (nullable).
 * 
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: "revisionthesis"`: Database table name (`revisionthesis`).
 * 
 * Relationships:
 * - `belongsTo(User, { foreignKey: "user_id" })`: A thesis revision is assigned to a user.
 * - `belongsTo(Sede, { foreignKey: "sede_id" })`: A thesis revision is assigned to a sede.
 */
const RevisionThesis = sequelize.define(
  "RevisionThesis",
  {
    revision_thesis_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    active_process: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    date_revision: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    approval_letter_dir: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    thesis_dir: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "revisionthesis",
    timestamps: true,
  }
);

module.exports = RevisionThesis;
