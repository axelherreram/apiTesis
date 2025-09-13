const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");


/**
 * Model `CommentVersion` represents a version of a comment that can be updated by users with different roles.
 * 
 * Fields:
 * - `commentVersion_id`: Unique identifier for the comment version (PK, auto-increment).
 * - `comment`: Text of the comment version (required).
 * - `datecomment`: Date and time when the comment version was created (default: current date and time).
 * - `role`: Role of the user who posted the comment version, either "student" or "teacher" (required, validated).
 * - `comment_id`: ID of the original comment that this version is associated with (foreign key to `Comments`).
 * 
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: "commentVersion"`: Database table name (`commentVersion`).
 * 
 * Hooks:
 * - `beforeCreate`: Adjusts the date to the correct time zone before creating a new record.
 * 
 * Relationships:
 * - `belongsTo(Comments, { foreignKey: "comment_id" })`: Each comment version belongs to a specific comment.
 */
const CommentVersion = sequelize.define(
  "commentversion",
  {
    commentVersion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    datecomment: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [["student", "teacher"]],
          msg: "El rol debe ser 'student' o 'teacher'",
        },
      },
    },
    comment_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Comments",
        key: "comment_id",
      },
    },
  },
  {
    tableName: "commentversion",
    timestamps: false,
    hooks: {
      beforeCreate: (commentVersion, options) => {
        // Ajustar la fecha a la zona horaria correcta
        const currentDate = new Date();
        commentVersion.datecomment = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      },
    },
  }
);

module.exports = CommentVersion;