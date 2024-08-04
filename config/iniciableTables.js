const Entregas = require("../models/entregas");
const BitacoraApp = require("../models/bitacoraApp");
const Ciclos = require("../models/ciclos");
const Cursos = require("../models/cursos");
const notas = require("../models/notas");
const PropuestaTesis = require("../models/propuestaTesis");
const Roles = require("../models/roles");
const Sedes = require("../models/sede");
const Tareas = require("../models/tareas");
const TimelineEventos = require("../models/timelineEventos");
const Usuarios = require("../models/usuarios");

// Inicializar tables in la BD
const initializetables = async () => {
  try {
    // Creacion de roles 
    await Roles.findOrCreate({ where: { nombreRol: "ESTUDIANTE" }});
    await Roles.findOrCreate({ where: { nombreRol: "TERNA" }});
    await Roles.findOrCreate({ where: { nombreRol: "ADMINISTRADOR" } });

    // Creacion de sedes
    await Sedes.findOrCreate({ where: { nombreSede: "Guastatoya" } });
    await Sedes.findOrCreate({ where: { nombreSede: "Sanarate" } });
    
    // creacion de los ciclos
    await Ciclos.findOrCreate({ where: { nombreCiclo: "1-2018" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "2-2018" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "1-2019" } });
    await Ciclos.findOrCreate({ where: { nombreCiclo: "2-2019" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "1-2020" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "2-2020" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "1-2021" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "2-2021" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "1-2022" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "2-2022" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "1-2023" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "2-2023" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "1-2024" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "2-2024" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "1-2025" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "2-2025" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "1-2026" } });  
    await Ciclos.findOrCreate({ where: { nombreCiclo: "2-2026" } });  

    await Cursos.findOrCreate({ where: { nombreCurso: "Proyecto de Graduación I" } });
    await Cursos.findOrCreate({ where: { nombreCurso: "Proyecto de Graduación II" } });


    console.log(`Tablas inicializadas correctamente en la BD`);
  } catch (error) {
    console.error("Error initializing roles:", error);
  }
};

module.exports = initializetables;
