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
const typeTask = require("../models/typeTask");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const Year = require("../models/year");
const rolTerna = require("../models/rolTerna");
const groupTerna = require("../models/groupTerna");
const ternaAsignGroup = require("../models/ternaAsignGroup");
const ternaAsignStudent = require("../models/ternaAsignStudent");

const initializeTables = async () => {
  try {
    const now = new Date();
    const oneMonthLater = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );
    
    await Year.findOrCreate({ where: { year: now.getFullYear() } });

    await rolTerna.findOrCreate({ where: { rolTernaName: "Presidente" } });
    await rolTerna.findOrCreate({ where: { rolTernaName: "Secretario" } });
    await rolTerna.findOrCreate({ where: { rolTernaName: "Vocal" } });

    await Roles.findOrCreate({ where: { name: "Estudiante" } });
    await Roles.findOrCreate({ where: { name: "Catedrático" } });
    await Roles.findOrCreate({ where: { name: "Administrador" } });
    await Roles.findOrCreate({ where: { name: "SuperAdmin" } });


    await Sede.findOrCreate({ where: { nameSede: "Guastatoya" } });
    await Sede.findOrCreate({ where: { nameSede: "Sanarate" } });

    await typeTask.findOrCreate({ where: { name: "Propuesta de tesis" } });
    await typeTask.findOrCreate({ where: { name: "Entrega de capitulos" } });

    await Course.findOrCreate({
      where: { courseName: "Proyecto De Graduación I" },
    });
    await Course.findOrCreate({
      where: { courseName: "Proyecto De Graduación II" },
    });

    console.log("Tablas Inicializadas Correctamente En La BD");
  } catch (error) {
    console.error("Error al inicializar:", error);
  }
};

module.exports = initializeTables;
