const { DataTypes } = require("sequelize");
const User = require("./user");
const CourseSedeAssignment = require("./courseSedeAssignment");
const { sequelize } = require("../config/database");

/**
 * Model `CourseAssignment` - inscripción de un estudiante a un curso-sede-año.
 *
 * NORMALIZACIÓN: FKs ahora son NOT NULL. UNIQUE(student_id, asigCourse_id) en migración.
 */
const CourseAssignment = sequelize.define(
  "CourseAssignment",
  {
    courseAssignment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "user_id" },
    },
    asigCourse_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: CourseSedeAssignment, key: "asigCourse_id" },
    },
    note: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: false,
    tableName: "courseassignment",
  }
);

module.exports = CourseAssignment;
