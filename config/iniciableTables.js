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
    await Roles.findOrCreate({ where: { name: "Cordinador Sede" } });
    await Roles.findOrCreate({ where: { name: "Decano" } });
    await Roles.findOrCreate({ where: { name: "Cordinador de tesis" } });
    await Roles.findOrCreate({ where: { name: "Revisor" } });


    const sedes = [
      "Amatitlán", 
      "Boca del Monte", 
      "Chinautla", 
      "La Florida, Zona 19", 
      "El Naranjo, Mixco",
      "Guastatoya", 
      "Sanarate", 
      "Chiquimula", 
      "Escuintla", 
      "Quetzaltenango"
    ];
    
    const typeTasks = ["Propuesta de tesis", "Entrega de capitulos"];
    await Course.findOrCreate({
      where: { courseName: "Proyecto De Graduación I" },
    });
    await Course.findOrCreate({
      where: { courseName: "Proyecto De Graduación II" },
    });
    
    // Función para insertar registros de forma eficiente
    const bulkInsert = async (model, values, key) => {
      await Promise.all(values.map(async (value) => {
        await model.findOrCreate({ where: { [key]: value } });
      }));
    };

    await bulkInsert(Sede, sedes, "nameSede");
    await bulkInsert(typeTask, typeTasks, "name");

    console.log("Tablas Inicializadas Correctamente En La BD");
  } catch (error) {
    console.error("Error al inicializar:", error);
  }
};

module.exports = initializeTables;
