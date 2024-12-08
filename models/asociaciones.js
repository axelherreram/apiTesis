const User = require("./user");
const CourseAssignment = require("./courseAssignment");
const Course = require("./course");
const Sede = require("./sede");
const CourseSedeAssignment = require("./courseSedeAssignment");
const Roles = require("./roles");
const TimelineEventos = require("./timelineEventos");
const Task = require("./task");
const Comisiones = require("./comisiones");
const Year = require("./year");
const rolComision = require("./rolComision");
const GroupComision = require("./groupComision");
const EstudianteComision = require("./estudianteComision");
const TypeTask = require("./typeTask");
const Comments = require('./comments');
const CommentVersion = require('./commentVersion');


module.exports = function associateModels() {
  // Relación entre Task y CourseSedeAssignment
  Task.belongsTo(CourseSedeAssignment, { foreignKey: "asigCourse_id" });
  CourseSedeAssignment.hasMany(Task, { foreignKey: "asigCourse_id" });

  // Relación entre Task y TypeTask
  Task.belongsTo(TypeTask, { foreignKey: "typeTask_id" });
  TypeTask.hasMany(Task, { foreignKey: "typeTask_id" });

  // Relación entre Task y Year
  Task.belongsTo(Year, { foreignKey: "year_id" });
  Year.hasMany(Task, { foreignKey: "year_id" });

  // Relación entre TimelineEventos y Task
  TimelineEventos.belongsTo(Task, { foreignKey: "task_id" });
  Task.hasMany(TimelineEventos, { foreignKey: "task_id" });

  // Otras relaciones existentes no afectadas
  User.belongsTo(Sede, { foreignKey: "sede_id", as: "location" });
  Sede.hasMany(User, { foreignKey: "sede_id" });

  User.hasMany(CourseAssignment, { foreignKey: "student_id" });
  CourseAssignment.belongsTo(User, { foreignKey: "student_id" });

  CourseSedeAssignment.belongsTo(Course, { foreignKey: "course_id" });
  CourseSedeAssignment.belongsTo(Sede, { foreignKey: "sede_id" });
  Course.hasMany(CourseSedeAssignment, { foreignKey: "course_id" });
  Sede.hasMany(CourseSedeAssignment, { foreignKey: "sede_id" });

  CourseSedeAssignment.hasMany(CourseAssignment, {
    foreignKey: "asigCourse_id",
  });
  CourseAssignment.belongsTo(CourseSedeAssignment, {
    foreignKey: "asigCourse_id",
  });

  User.hasMany(CourseSedeAssignment, { foreignKey: "sede_id" });

  TimelineEventos.belongsTo(User, { foreignKey: "user_id" });
  User.hasMany(TimelineEventos, { foreignKey: "user_id" });

  User.belongsTo(Roles, { foreignKey: "rol_id", as: "role" });

  User.belongsTo(Year, { foreignKey: "year_id", as: "year" });
  Year.hasMany(User, { foreignKey: "year_id" });

  User.hasMany(Comisiones, { foreignKey: "user_id", as: "comisiones" });
  Comisiones.belongsTo(User, { foreignKey: "user_id" });

  Comisiones.belongsTo(Year, { foreignKey: "year_id" });
  Year.hasMany(Comisiones, { foreignKey: "year_id" });

  Comisiones.belongsTo(rolComision, { foreignKey: "rol_comision_id" });
  rolComision.hasMany(Comisiones, { foreignKey: "rol_comision_id" });

  GroupComision.hasMany(Comisiones, {
    foreignKey: "group_id",
    as: "comisiones",
  });
  Comisiones.belongsTo(GroupComision, { foreignKey: "group_id" });

  GroupComision.belongsTo(Sede, { foreignKey: "sede_id" });
  Sede.hasMany(GroupComision, { foreignKey: "sede_id" });
  GroupComision.belongsTo(Year, { foreignKey: "year_id" });
  Year.hasMany(GroupComision, { foreignKey: "year_id" });

  EstudianteComision.belongsTo(User, { foreignKey: "user_id", as: "student" });
  User.hasMany(EstudianteComision, {
    foreignKey: "user_id",
    as: "studentAssignments",
  });

  GroupComision.hasMany(EstudianteComision, {
    foreignKey: "group_id",
    as: "estudianteComisiones",
  });
  EstudianteComision.belongsTo(GroupComision, {
    foreignKey: "group_id",
    as: "group",
  });


  Comments.hasMany(CommentVersion, { foreignKey: 'comment_id' });
  CommentVersion.belongsTo(Comments, { foreignKey: 'comment_id' });
  
  CommentVersion.belongsTo(User, { foreignKey: 'user_id' });
  User.hasMany(CommentVersion, { foreignKey: 'user_id' });

};
