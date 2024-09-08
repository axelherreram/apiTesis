const User = require('./user');
const CourseAssignment = require('./courseAssignment');
const Course = require('./course');
const StudentAssignment = require('./studentAssignment');
const Sede = require('./sede');
const CourseSedeAssignment = require('./courseSedeAssignment');

module.exports = function associateModels() {
  // Relación entre User y Sede (muchos usuarios pertenecen a una sede)
  User.belongsTo(Sede, { foreignKey: 'sede_id', as: 'location' });
  Sede.hasMany(User, { foreignKey: 'sede_id' });

  // Relación entre User y CourseAssignment (un estudiante puede tener muchas asignaciones de curso)
  User.hasMany(CourseAssignment, { foreignKey: 'student_id' });
  CourseAssignment.belongsTo(User, { foreignKey: 'student_id' });

  // Relación entre CourseAssignment y Course
  CourseAssignment.belongsTo(Course, { foreignKey: 'course_id' });

  // Relación entre User y StudentAssignment (un estudiante o un instructor puede estar asignado a muchas actividades)
  User.hasMany(StudentAssignment, { foreignKey: 'student_id', as: 'studentAssignments' });
  User.hasMany(StudentAssignment, { foreignKey: 'instructor_id', as: 'instructorAssignments' });

  // Relación entre StudentAssignment y User (como estudiante y como instructor)
  StudentAssignment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
  StudentAssignment.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });

  // Relación entre CourseSedeAssignment, Course y Sede (muchos cursos pueden estar asignados a muchas sedes)
  CourseSedeAssignment.belongsTo(Course, { foreignKey: 'course_id' });
  CourseSedeAssignment.belongsTo(Sede, { foreignKey: 'sede_id' });
  Course.hasMany(CourseSedeAssignment, { foreignKey: 'course_id' });
  Sede.hasMany(CourseSedeAssignment, { foreignKey: 'sede_id' });
};
