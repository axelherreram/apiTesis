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
const Comments = require("./comments");
const CommentVersion = require("./commentVersion");
const ThesisSubmission = require("./thesisSubmissions");
const TaskSubmissions = require("./taskSubmissions");

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

  // Relación entre User y Sede
  User.belongsTo(Sede, { foreignKey: "sede_id", as: "location" });
  Sede.hasMany(User, { foreignKey: "sede_id" });

  // Relación entre User y CourseAssignment
  User.hasMany(CourseAssignment, { foreignKey: "student_id" });
  CourseAssignment.belongsTo(User, { foreignKey: "student_id" });

  // Relación entre CourseSedeAssignment, Course y Sede
  CourseSedeAssignment.belongsTo(Course, { foreignKey: "course_id" });
  CourseSedeAssignment.belongsTo(Sede, { foreignKey: "sede_id" });
  Course.hasMany(CourseSedeAssignment, { foreignKey: "course_id" });
  Sede.hasMany(CourseSedeAssignment, { foreignKey: "sede_id" });

  // Relación entre CourseSedeAssignment y CourseAssignment
  CourseSedeAssignment.hasMany(CourseAssignment, {
    foreignKey: "asigCourse_id",
  });
  CourseAssignment.belongsTo(CourseSedeAssignment, {
    foreignKey: "asigCourse_id",
  });

  // Relación entre User y CourseSedeAssignment
  User.hasMany(CourseSedeAssignment, { foreignKey: "sede_id" });

  // Relación entre TimelineEventos y User
  TimelineEventos.belongsTo(User, { foreignKey: "user_id" });
  User.hasMany(TimelineEventos, { foreignKey: "user_id" });

  // Relación entre User y Roles
  User.belongsTo(Roles, { foreignKey: "rol_id", as: "role" });

  // Relación entre User y Year
  User.belongsTo(Year, { foreignKey: "year_id", as: "year" });
  Year.hasMany(User, { foreignKey: "year_id" });

  // Relación entre User y Comisiones
  User.hasMany(Comisiones, { foreignKey: "user_id", as: "comisiones" });
  Comisiones.belongsTo(User, { foreignKey: "user_id" });

  // Relación entre Comisiones y Year
  Comisiones.belongsTo(Year, { foreignKey: "year_id" });
  Year.hasMany(Comisiones, { foreignKey: "year_id" });

  // Relación entre Comisiones y rolComision
  Comisiones.belongsTo(rolComision, { foreignKey: "rol_comision_id" });
  rolComision.hasMany(Comisiones, { foreignKey: "rol_comision_id" });

  // Relación entre GroupComision y Comisiones
  GroupComision.hasMany(Comisiones, {
    foreignKey: "group_id",
    as: "comisiones",
  });
  Comisiones.belongsTo(GroupComision, { foreignKey: "group_id" });

  // Relación entre GroupComision y Sede
  GroupComision.belongsTo(Sede, { foreignKey: "sede_id" });
  Sede.hasMany(GroupComision, { foreignKey: "sede_id" });

  // Relación entre GroupComision y Year
  GroupComision.belongsTo(Year, { foreignKey: "year_id" });
  Year.hasMany(GroupComision, { foreignKey: "year_id" });

  // Relación entre EstudianteComision y User
  EstudianteComision.belongsTo(User, { foreignKey: "user_id", as: "student" });
  User.hasMany(EstudianteComision, {
    foreignKey: "user_id",
    as: "studentAssignments",
  });

  // Relación entre GroupComision y EstudianteComision
  GroupComision.hasMany(EstudianteComision, {
    foreignKey: "group_id",
    as: "estudianteComisiones",
  });
  EstudianteComision.belongsTo(GroupComision, {
    foreignKey: "group_id",
    as: "group",
  });

  // Relación entre Comments y CommentVersion
  Comments.hasMany(CommentVersion, { foreignKey: "comment_id" });
  CommentVersion.belongsTo(Comments, { foreignKey: "comment_id" });
/* 
  // Relación entre CommentVersion y User
  CommentVersion.belongsTo(User, { foreignKey: "user_id" });
  User.hasMany(CommentVersion, { foreignKey: "user_id" });
 */
  // Relación entre User y ThesisSubmission
  User.hasMany(ThesisSubmission, {
    foreignKey: "user_id",
    as: "thesisSubmissions",
  });
  ThesisSubmission.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // Relación entre Task y ThesisSubmission
  Task.hasMany(ThesisSubmission, {
    foreignKey: "task_id",
    as: "thesisSubmissions",
  });
  ThesisSubmission.belongsTo(Task, {
    foreignKey: "task_id",
    as: "task",
  });

    // Relación entre User y TaskSubmissions
    User.hasMany(TaskSubmissions, { foreignKey: "user_id" });
    TaskSubmissions.belongsTo(User, { foreignKey: "user_id" });
  
    // Relación entre Task y TaskSubmissions
    Task.hasMany(TaskSubmissions, { foreignKey: "task_id" });
    TaskSubmissions.belongsTo(Task, { foreignKey: "task_id" });
  
    // Relación entre User y ThesisSubmission
    User.hasMany(ThesisSubmission, { foreignKey: "user_id" });
    ThesisSubmission.belongsTo(User, { foreignKey: "user_id" });
  
    // Relación entre Task y ThesisSubmission
    Task.hasMany(ThesisSubmission, { foreignKey: "task_id" });
    ThesisSubmission.belongsTo(Task, { foreignKey: "task_id" });
};