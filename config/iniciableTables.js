const Entregas = require("../models/entregas");
const BitacoraApp = require("../models/bitacoraApp");
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
    const now = new Date();
    const oneMonthLater = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );

    // Creacion de roles
    await Roles.findOrCreate({ where: { nombreRol: "Estudiante" } });
    await Roles.findOrCreate({ where: { nombreRol: "Catedrático" } });
    await Roles.findOrCreate({ where: { nombreRol: "Administrador" } });

    // Creacion de sedes
    await Sedes.findOrCreate({ where: { nombreSede: "Guastatoya" } });
    await Sedes.findOrCreate({ where: { nombreSede: "Sanarate" } });

    await Cursos.findOrCreate({
      where: { nombreCurso: "Proyecto De Graduación I" },
    });
    await Cursos.findOrCreate({
      where: { nombreCurso: "Proyecto De Graduación II" },
    });
    
    // Creación De Las Tareas De Propuesta De Tesis Solo 3 Por Usuario
    await Tareas.findOrCreate({
      where: {
        curso_id: 1,
        titulo: "Propuestas De Tesis",
      },
      defaults: {
        descripcion: "Sube Tus 3 Propuestas De Tesis",
        inicioTarea: now,
        finTarea: oneMonthLater,
      },
    });

    // Creación De Las Tareas De Los 3 Capítulos De Proyecto De Graduación I
    await Tareas.findOrCreate({
      where: {
        curso_id: 1,
        titulo: "Capitulo 1",
      },
      defaults: {
        descripcion: "Realizar El Capítulo 1 Del Proyecto De Graduación",
      },
    });
    await Tareas.findOrCreate({
      where: {
        curso_id: 1,
        titulo: "Capitulo 2",
      },
      defaults: {
        descripcion: "Realizar El Capítulo 2 Del Proyecto De Graduación",
      },
    });
    await Tareas.findOrCreate({
      where: {
        curso_id: 1,
        titulo: "Capitulo 3",
      },
      defaults: {
        descripcion: "Realizar El Capítulo 3 Del Proyecto De Graduación",
      },
    });

    // Creación De Las Tareas De Los 3 Capítulos De Proyecto De Graduación II
    await Tareas.findOrCreate({
      where: {
        curso_id: 2,
        titulo: "Capitulo 4",
      },
      defaults: {
        descripcion: "Realizar El Capítulo 4 Del Proyecto De Graduación",
      },
    });
    await Tareas.findOrCreate({
      where: {
        curso_id: 2,
        titulo: "Capitulo 5",
      },
      defaults: {
        descripcion: "Realizar El Capítulo 5 Del Proyecto De Graduación",
      },
    });
    await Tareas.findOrCreate({
      where: {
        curso_id: 2,
        titulo: "Capitulo 6",
      },
      defaults: {
        descripcion: "Realizar El Capítulo 6 Del Proyecto De Graduación",
      },
    });

    console.log(`Tablas Inicializadas Correctamente En La BD`);
  } catch (error) {
    console.error("Error Initializing:", error);
  }
};

module.exports = initializetables;
