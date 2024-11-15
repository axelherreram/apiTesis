const Submissions = require("../models/submissions");
const AppLog = require("../models/appLog");
const Course = require("../models/course");
const Qualification = require("../models/qualification");
const Roles = require("../models/roles");
const Sede = require("../models/sede");
const Task = require("../models/task");
const TimelineEvents = require("../models/timelineEventos");
const User = require("../models/user");
const CourseAssignment = require("../models/courseAssignment");
const typeTask = require("../models/typeTask");
const CourseSedeAssignment = require("../models/courseSedeAssignment");
const Year = require("../models/year");
const rolComision = require("../models/rolComision");
const Comisiones = require("../models/Comisiones");
const EstudianteComision = require("../models/estudianteComision");

const initializeTables = async () => {
  try {
    const now = new Date();
    const oneMonthLater = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );
    
    await Year.findOrCreate({ where: { year: now.getFullYear() } });

    await rolComision.findOrCreate({ where: { rolComisionName: "Presidente" } });
    await rolComision.findOrCreate({ where: { rolComisionName: "Secretario" } });
    await rolComision.findOrCreate({ where: { rolComisionName: "Vocal" } });
    await rolComision.findOrCreate({ where: { rolComisionName: "Suplente" } });
    

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
