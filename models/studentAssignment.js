const User = require("./user");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");  

const StudentAssignment = sequelize.define(
  "StudentAssignment",
  {
    assignment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    instructor_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "user_id",
      },
    },
    student_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "user_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "StudentAssignment",
  }
);

StudentAssignment.associate = function (models) {
  StudentAssignment.belongsTo(models.User, {
    foreignKey: "student_id",
    as: "student",
  });
  StudentAssignment.belongsTo(models.User, {
    foreignKey: "instructor_id",
    as: "instructor",
  });
};

module.exports = StudentAssignment;
