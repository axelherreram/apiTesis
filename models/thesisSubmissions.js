const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const Task = require("./task");

/**
 * Model `thesisSubmissions` represents the submissions related to thesis work by students.
 * 
 * Fields:
 * - `thesisSubmissions_id`: Unique identifier for the thesis submission (Primary Key, auto-increment).
 * - `user_id`: Reference to the student submitting the thesis (`User` model).
 * - `task_id`: Reference to the related task (`Task` model).
 * - `file_path`: Path where the submitted file is stored.
 * - `date`: Date of submission (Default: current timestamp, adjusted for timezone).
 * - `approved_proposal`: Status of the thesis submission:
 *     - `0`: Pending review
 *     - `1`: Approved
 *     - `2`: Requires modifications
 *     - `3`: Rejected
 * 
 * Configuration:
 * - `timestamps: false`: No automatic `createdAt` or `updatedAt` fields.
 * - `tableName: 'thesisSubmissions'`: Database table name.
 * - `hooks.beforeCreate`: Adjusts `date` to the correct timezone before saving.
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    approved_proposal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isIn: {
          args: [[0, 1, 2, 3]],
          msg: "El valor de 'approved_proposal' debe ser 0, 1, 2 o 3",
        },
      },
    },
  },
  {
    tableName: "thesisSubmissions",
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