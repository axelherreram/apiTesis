const { DataTypes } = require("sequelize");
const Course = require("./course");
const Sede = require("./sede");
const { sequelize } = require("../config/database");
const Year = require("./year");

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
