const { DataTypes } = require("sequelize");
const User = require("./user");
const CourseSedeAssignment = require("./courseSedeAssignment");
const { sequelize } = require("../config/database");

/**
 * Model `CourseAssignment` represents the assignment of a course to a student.
 *
 * Fields:
 * - `courseAssignment_id`: Unique identifier for the course assignment (PK, auto-increment).
 * - `student_id`: Foreign key referencing the `User` model, representing the student assigned to the course.
 * - `asigCourse_id`: Foreign key referencing the `CourseSedeAssignment` model, representing the specific course assignment at a given site.
 *
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: 'CourseAssignment'`: Database table name (`CourseAssignment`).
 *
 * Relationships:
 * - `CourseAssignment.belongsTo(models.User, { foreignKey: 'student_id' })`: Defines a many-to-one relationship with the `User` model.
 * - `CourseAssignment.belongsTo(models.CourseSedeAssignment, { foreignKey: 'asigCourse_id' })`: Defines a many-to-one relationship with the `CourseSedeAssignment` model.
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
      references: {
        model: User,
        key: "user_id",
      },
    },
    asigCourse_id: {
      type: DataTypes.INTEGER,
      references: {
        model: CourseSedeAssignment,
        key: "asigCourse_id",
      },
    },
    note: {
      type: DataTypes.FLOAT(4,2),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: false,
    tableName: "Courseassignment",
  }
);

CourseAssignment.associate = function (models) {
  CourseAssignment.belongsTo(models.User, { foreignKey: "student_id" });
  CourseAssignment.belongsTo(models.CourseSedeAssignment, {
    foreignKey: "asigCourse_id",
  });
};

module.exports = CourseAssignment;
