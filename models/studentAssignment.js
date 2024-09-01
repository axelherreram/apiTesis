const User = require("./user");  // Usuarios actualizado a Users
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StudentAssignment = sequelize.define(  // AsignacionEstudiante actualizado a StudentAssignment
  "StudentAssignment",
  {
    assignment_id: {  // asignacion_id actualizado a assignment_id
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    instructor_id: {  // catedratico_id actualizado a instructor_id
      type: DataTypes.INTEGER,
      references: {
        model: User,  // Usuarios actualizado a Users
        key: "user_id",
      },
    },
    student_id: {  // estudiante_id actualizado a student_id
      type: DataTypes.INTEGER,
      references: {
        model: User,  // Usuarios actualizado a Users
        key: "user_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "StudentAssignment",  // AsignacionEstudiante actualizado a StudentAssignment
  }
);

// Definición de las asociaciones
StudentAssignment.associate = function (models) {
  StudentAssignment.belongsTo(models.Users, {
    foreignKey: "student_id",  // estudiante_id actualizado a student_id
    as: "student",  // estudiante actualizado a student
  });
  StudentAssignment.belongsTo(models.Users, {
    foreignKey: "instructor_id",  // catedratico_id actualizado a instructor_id
    as: "instructor",  // catedratico actualizado a instructor
  });
};

module.exports = StudentAssignment;  // Exportación actualizada
