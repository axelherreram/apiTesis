const { DataTypes } = require("sequelize");
const Course = require("./course");
const Sede = require("./sede");
const { sequelize } = require("../config/database");  

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
      references: {
        model: Course,
        key: "course_id",
      },
    },
    sede_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    courseActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "CourseSedeAssignment",
  }
);



module.exports = CourseSedeAssignment;
