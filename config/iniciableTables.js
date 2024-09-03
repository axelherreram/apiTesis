const Submissions = require("../models/submissions");
const AppLog = require("../models/appLog");
const Course = require("../models/course");
const Qualification = require("../models/qualification");
const ThesisProposal = require("../models/thesisProposal");
const Roles = require("../models/roles");
const Sede = require("../models/sede");
const Task = require("../models/task");
const TimelineEvents = require("../models/timelineEventos");
const User = require("../models/user");
const StudentAssignment = require("../models/studentAssignment");
const CourseAssignment = require("../models/courseAssignment");

const initializeTables = async () => {
  try {
    const now = new Date();
    const oneMonthLater = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );

    await Roles.findOrCreate({ where: { name: "Estudiante" } });
    await Roles.findOrCreate({ where: { name: "Catedrático" } });
    await Roles.findOrCreate({ where: { name: "Administrador" } });

    await Sede.findOrCreate({ where: { nameSede: "Guastatoya" } });
    await Sede.findOrCreate({ where: { nameSede: "Sanarate" } });

    await Course.findOrCreate({
      where: { courseName: "Proyecto De Graduación I" },
    });
    await Course.findOrCreate({
      where: { courseName: "Proyecto De Graduación II" },
    });

    await Task.findOrCreate({
      where: {
        course_id: 1,
        title: "Propuestas De Tesis",
        sede_id: 1,
      },
      defaults: {
        description: "Sube Tus 3 Propuestas De Tesis",
        taskStart: now,
        endTask: oneMonthLater,
      },
    });

    await Task.findOrCreate({
      where: {
        course_id: 1,
        title: "Propuestas De Tesis",
        sede_id: 2,
      },
      defaults: {
        description: "Sube Tus 3 Propuestas De Tesis",
        taskStart: now,
        endTask: oneMonthLater,
      },
    });

    console.log("Tablas Inicializadas Correctamente En La BD");
  } catch (error) {
    console.error("Error al inicializar:", error);
  }
};

module.exports = initializeTables;
