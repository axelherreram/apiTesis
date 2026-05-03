const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const Task = require("./task");

/**
 * Model `thesisSubmissions` represents thesis submissions made by students.
 *
 * Fields:
 * - `thesisSubmissions_id`: Unique identifier (PK, auto-increment).
 * - `user_id`: FK to `User`, the student submitting the thesis.
 * - `task_id`: FK to `Task`, the related task.
 * - `file_path`: Path where the submitted file is stored (STRING(500), required).
 * - `date`: Date of submission (default: current timestamp, adjusted for timezone).
 * - `approved_proposal`: Approval status — ENUM('pending', 'approved', 'needs_changes', 'rejected').
 *
 * NORMALIZACIÓN:
 * - `approved_proposal` convertido de INTEGER (0-3) a ENUM semántico autoexplicativo.
 * - `file_path` ampliado a STRING(500) para rutas largas.
 *
 * Configuration:
 * - `timestamps: false`: No automatic `createdAt` / `updatedAt`.
 * - `tableName: 'thesissubmissions'`: Database table name.
 *
 * Hooks:
 * - `beforeCreate`: Adjusts `date` to correct timezone before saving.
 */
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
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    approved_proposal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "thesissubmissions",
    timestamps: false,
    hooks: {
      beforeCreate: (thesisSubmission, options) => {
        const currentDate = new Date();
        thesisSubmission.date = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      },
    },
  }
);

module.exports = thesisSubmissions;