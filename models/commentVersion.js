const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Comments = require("./comments");

/**
 * Model `CommentVersion` represents a versioned entry of a comment.
 *
 * Fields:
 * - `commentVersion_id`: Unique identifier (PK, auto-increment).
 * - `comment_id`: FK to `Comments`, the parent comment (required).
 * - `comment`: Text content of the comment version (TEXT, required).
 * - `role`: Role of the commenter — ENUM('student', 'teacher') (required).
 * - `datecomment`: Date/time of the comment (default: NOW).
 *
 * NORMALIZACIÓN:
 * - `role` convertido de STRING libre a ENUM para garantizar integridad en BD.
 * - `comment` cambiado de STRING a TEXT para soportar contenido largo.
 * - `comment_id` ahora es NOT NULL (FK obligatoria).
 *
 * Configuration:
 * - `timestamps: false`: No automatic `createdAt` / `updatedAt`.
 * - `tableName: 'commentversion'`: Database table name.
 *
 * Hooks:
 * - `beforeCreate`: Adjusts date to correct timezone before saving.
 */
const CommentVersion = sequelize.define(
  "CommentVersion",
  {
    commentVersion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    comment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Comments,
        key: "comment_id",
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "teacher"),
      allowNull: false,
    },
    datecomment: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "commentversion",
    timestamps: false,
    hooks: {
      beforeCreate: (commentVersion, options) => {
        const currentDate = new Date();
        commentVersion.datecomment = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      },
    },
  }
);

module.exports = CommentVersion;