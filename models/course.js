const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");  

/**
 * Model `Course` represents a course entity with its basic details.
 * 
 * Fields:
 * - `course_id`: Unique identifier for the course (PK, auto-increment).
 * - `courseName`: Name of the course (required).
 * 
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: 'Course'`: Database table name (`Course`).
 * 
 * Relationships:
 * - The `Course` model can be related to other models (not defined in this snippet).
 */
const Course = sequelize.define("Course", {
  course_id: {  
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseName: {  
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'course'
});

module.exports = Course;
