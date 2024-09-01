const User = require('./user');
const CourseAssignment = require('./courseAssignment');
const Course = require('./course');
const StudentAssignment = require('./studentAssignment');
const Sede = require('./sede');

module.exports = function associateModels() {
  User.hasMany(CourseAssignment, { foreignKey: 'student_id' });
  User.hasMany(StudentAssignment, { foreignKey: 'student_id', as: 'studentAssignments' });
  User.hasMany(StudentAssignment, { foreignKey: 'instructor_id', as: 'instructorAssignments' });

  CourseAssignment.belongsTo(User, { foreignKey: 'student_id' });
  CourseAssignment.belongsTo(Course, { foreignKey: 'course_id' });

  StudentAssignment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
  StudentAssignment.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });

  User.belongsTo(Sede, { foreignKey: 'sede_id', as: 'location' });
  Sede.hasMany(User, { foreignKey: 'sede_id' });
};
