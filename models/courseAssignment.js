const { DataTypes } = require("sequelize");
const User = require("./user");
const CourseSedeAssignment = require("./courseSedeAssignment");
const { sequelize } = require("../config/database");

const CourseAssignment = sequelize.define("CourseAssignment", {
  courseAssignment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "user_id",
    },
  },
  asigCourse_id: {  // Relación con CourseSedeAssignment
    type: DataTypes.INTEGER,
    references: {
      model: CourseSedeAssignment,
      key: "asigCourse_id",
    },
  },
}, {
  timestamps: false,
  tableName: "CourseAssignment",
});

CourseAssignment.associate = function(models) {
  CourseAssignment.belongsTo(models.User, { foreignKey: 'student_id' });  // Relación con User
  CourseAssignment.belongsTo(models.CourseSedeAssignment, { foreignKey: 'asigCourse_id' });  // Relación con CourseSedeAssignment
};

module.exports = CourseAssignment;
