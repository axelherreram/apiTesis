const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Course = sequelize.define("Course", {
  course_id: {  // curso_id
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseName: {  // nombreCurso
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'Course'
});

module.exports = Course;
