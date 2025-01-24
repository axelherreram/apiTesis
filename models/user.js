const { DataTypes } = require("sequelize");
const Roles = require("./roles");
const Sede = require("./sede");
const Year = require("./year");
const { sequelize } = require("../config/database");


/**
 * Model `User` represents a user within the system, which could be a student, teacher, or other roles.
 * 
 * Fields:
 * - `user_id`: Unique identifier for the user (Primary Key, auto-increment).
 * - `email`: The user's email (Required).
 * - `password`: The user's password (Required).
 * - `name`: The user's full name (Required).
 * - `carnet`: The user's identification number (Optional, Unique).
 * - `sede_id`: Foreign key referencing the `Sede` model, indicating the user's location (Optional).
 * - `rol_id`: Foreign key referencing the `Roles` model, representing the user's role (Required, defaults to 1).
 * - `year_id`: Foreign key referencing the `Year` model, indicating the year associated with the user (Optional).
 * - `profilePhoto`: URL to the user's profile photo (Optional).
 * - `active`: Boolean indicating whether the user is active (Optional, defaults to true).
 * - `passwordUpdate`: Boolean indicating whether the user needs to update their password (Optional, defaults to false).
 * 
 * Configuration:
 * - `timestamps: false`: No automatic `createdAt` or `updatedAt` fields.
 * - `tableName: 'User'`: Database table name.
 * 
 * Associations:
 * - A `User` can have many course assignments (`CursoAsignacion`) as a student.
 * - A `User` can have many student assignments (`AsignacionEstudiante`) as both a student and a teacher.
 * - A `User` belongs to a `Sede` (location).
 */

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    carnet: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
    },
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: Roles,
        key: "rol_id",
      },
    },
    year_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Year,
        key: "year_id",
      },
    },
    profilePhoto: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    passwordUpdate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
    tableName: "User",
  }
);

User.associate = function (models) {
  User.hasMany(models.CursoAsignacion, { foreignKey: "estudiante_id" });
  // Relación de muchos a uno entre usuarios y asignaciones como estudiantes
  User.hasMany(models.AsignacionEstudiante, {
    foreignKey: "estudiante_id",
    as: "asignacionesEstudiante",
  });

  User.hasMany(models.AsignacionEstudiante, {
    foreignKey: "catedratico_id",
    as: "asignacionesCatedratico",
  });

  User.belongsTo(models.Sede, { foreignKey: "sede_id", as: "sede" });
};

module.exports = User;
