const { DataTypes } = require("sequelize");
const Course = require("./course");
const Sede = require("./sede");
const { sequelize } = require("../config/database");
const Year = require("./year");

/**
 * Model `CourseSedeAssignment` represents the assignment of a course to a specific site (Sede) and year.
 * 
 * Fields:
 * - `asigCourse_id`: Unique identifier for the course-site assignment (PK, auto-increment).
 * - `course_id`: Foreign key referencing the `Course` model, representing the course assigned.
 * - `sede_id`: Foreign key referencing the `Sede` model, representing the site where the course is assigned.
 * - `year_id`: Foreign key referencing the `Year` model, representing the academic year of the assignment.
 * - `courseActive`: Boolean field to indicate if the course is active or not at the given site and year.
 * 
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: 'CourseSedeAssignment'`: Database table name (`CourseSedeAssignment`).
 */
const CourseSedeAssignment = sequelize.define(
  "CourseSedeAssignment",
  {
    asigCourse_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Course,
        key: "course_id",
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
    year_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Year,
        key: "year_id",
      },
    },
    courseActive: {
      type: DataTypes.BOOLEAN,
    },

  },
  {
    timestamps: false,
    tableName: "CourseSedeAssignment",
  }
);

module.exports = CourseSedeAssignment;
