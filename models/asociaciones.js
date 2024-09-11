const User = require('./user');
const CourseAssignment = require('./courseAssignment');
const Course = require('./course');
const StudentAssignment = require('./studentAssignment');
const Sede = require('./sede');
const CourseSedeAssignment = require('./courseSedeAssignment');
const groupTerna = require('./groupTerna');
const rolTerna = require('./rolTerna');
const ternaAsignGroup = require('./ternaAsignGroup');

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

  // Agregamos las nuevas relaciones para Terna

  // Relación entre ternaAsignGroup y User (una asignación de terna pertenece a un usuario)
  ternaAsignGroup.belongsTo(User, { foreignKey: 'user_id' });
  User.hasMany(ternaAsignGroup, { foreignKey: 'user_id' });

  // Relación entre ternaAsignGroup y groupTerna (una asignación de terna pertenece a un grupo)
  ternaAsignGroup.belongsTo(groupTerna, { foreignKey: 'groupTerna_id' });
  groupTerna.hasMany(ternaAsignGroup, { foreignKey: 'groupTerna_id' });

  // Relación entre ternaAsignGroup y rolTerna (una asignación de terna tiene un rol)
  ternaAsignGroup.belongsTo(rolTerna, { foreignKey: 'rolTerna_id' });
  rolTerna.hasMany(ternaAsignGroup, { foreignKey: 'rolTerna_id' });
};
