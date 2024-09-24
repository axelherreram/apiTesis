const User = require('./user');
const CourseAssignment = require('./courseAssignment');
const Course = require('./course');
const StudentAssignment = require('./studentAssignment');
const Sede = require('./sede');
const CourseSedeAssignment = require('./courseSedeAssignment');
const groupTerna = require('./groupTerna');
const rolTerna = require('./rolTerna');
const ternaAsignGroup = require('./ternaAsignGroup');
const Roles = require('./roles');
const TimelineEventos = require('./timelineEventos');
const Task = require('./task');

module.exports = function associateModels() {
  // Relación entre User y Sede
  User.belongsTo(Sede, { foreignKey: 'sede_id', as: 'location' });
  Sede.hasMany(User, { foreignKey: 'sede_id' });

  // Relación entre User y CourseAssignment
  User.hasMany(CourseAssignment, { foreignKey: 'student_id' });
  CourseAssignment.belongsTo(User, { foreignKey: 'student_id' });

  // Relación entre CourseAssignment y Course
  CourseAssignment.belongsTo(Course, { foreignKey: 'course_id' });

  // Relación entre User y StudentAssignment
  User.hasMany(StudentAssignment, { foreignKey: 'student_id', as: 'studentAssignments' });
  User.hasMany(StudentAssignment, { foreignKey: 'instructor_id', as: 'instructorAssignments' });

  // Relación entre StudentAssignment y User
  StudentAssignment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
  StudentAssignment.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });

  // Relación entre CourseSedeAssignment, Course y Sede
  CourseSedeAssignment.belongsTo(Course, { foreignKey: 'course_id' });
  CourseSedeAssignment.belongsTo(Sede, { foreignKey: 'sede_id' });
  Course.hasMany(CourseSedeAssignment, { foreignKey: 'course_id' });
  Sede.hasMany(CourseSedeAssignment, { foreignKey: 'sede_id' });

  // Relación entre TimelineEventos, Task, User y Course
  TimelineEventos.belongsTo(User, { foreignKey: 'user_id' });
  TimelineEventos.belongsTo(Course, { foreignKey: 'course_id' });
  TimelineEventos.belongsTo(Task, { foreignKey: 'task_id' });
  Course.hasMany(TimelineEventos, { foreignKey: 'course_id' });
  Task.hasMany(TimelineEventos, { foreignKey: 'task_id' });
  User.hasMany(TimelineEventos, { foreignKey: 'user_id' });

  // Relación entre Task y CourseSedeAssignment
  Task.belongsTo(CourseSedeAssignment, { foreignKey: 'course_id' });

  // Agregar relaciones de Terna
  ternaAsignGroup.belongsTo(User, { foreignKey: 'user_id' });
  User.hasMany(ternaAsignGroup, { foreignKey: 'user_id' });

  ternaAsignGroup.belongsTo(groupTerna, { foreignKey: 'groupTerna_id' });
  groupTerna.hasMany(ternaAsignGroup, { foreignKey: 'groupTerna_id' });

  ternaAsignGroup.belongsTo(rolTerna, { foreignKey: 'rolTerna_id' });
  rolTerna.hasMany(ternaAsignGroup, { foreignKey: 'rolTerna_id' });

  // Relación entre User y Roles
  User.belongsTo(Roles, { foreignKey: 'rol_id', as: 'role' });
};
