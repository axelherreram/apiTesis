const { DataTypes } = require("sequelize");
const User = require("./user");
const Course = require("./course");
const { sequelize } = require("../config/database");  
const Year = require("./year");
const CourseAssignment = sequelize.define(
  "CourseAssignment",  
  {
    courseAssignment_id: {  
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {  // estudiante_id
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "user_id",
      },
    },
    course_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Course,
        key: "course_id",
      },
    },
    year_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Year,
        key: "year_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "CourseAssignment", 
  }
);

CourseAssignment.associate = function(models) {
  CourseAssignment.belongsTo(models.User, { foreignKey: 'student_id' });  // Usuarios -> User
  CourseAssignment.belongsTo(models.Course, { foreignKey: 'course_id' });  // Cursos -> Course
};

module.exports = CourseAssignment;
