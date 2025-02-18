const Course = require("../models/course");
const Roles = require("../models/roles");
const Sede = require("../models/sede");
const typeTask = require("../models/typeTask");
const Year = require("../models/year");
const rolComision = require("../models/rolComision");

const initializeTables = async () => {
  try {
    const now = new Date();
    
    await Year.findOrCreate({ where: { year: now.getFullYear() } });

    await rolComision.findOrCreate({ where: { rolComisionName: "Presidente" } });
    await rolComision.findOrCreate({ where: { rolComisionName: "Secretario" } });
    await rolComision.findOrCreate({ where: { rolComisionName: "Vocal 1" } });
    await rolComision.findOrCreate({ where: { rolComisionName: "Vocal 2" } });
    await rolComision.findOrCreate({ where: { rolComisionName: "Vocal 3" } });

    await Roles.findOrCreate({ where: { name: "Estudiante" } });
    await Roles.findOrCreate({ where: { name: "Catedrático" } });
    await Roles.findOrCreate({ where: { name: "Administrador" } });
    await Roles.findOrCreate({ where: { name: "SuperAdmin" } });
    await Roles.findOrCreate({ where: { name: "Decano" } });
    await Roles.findOrCreate({ where: { name: "Cordinador de tesis" } });
    await Roles.findOrCreate({ where: { name: "Revisor" } });

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
