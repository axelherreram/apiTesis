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
    await Roles.findOrCreate({ where: { nombreRol: "ESTUDIANTE" } });
    await Roles.findOrCreate({ where: { nombreRol: "TERNA" } });
    await Roles.findOrCreate({ where: { nombreRol: "ADMINISTRADOR" } });

    // Creacion de sedes
    await Sedes.findOrCreate({ where: { nombreSede: "GUASTATOYA" } });
    await Sedes.findOrCreate({ where: { nombreSede: "SANARATE" } });

    await Cursos.findOrCreate({
      where: { nombreCurso: "PROYECTO DE GRADUACIÓN I" },
    });
    await Cursos.findOrCreate({
      where: { nombreCurso: "PROYECTO DE GRADUACIÓN II" },
    });
    
    // CREACIÓN DE LAS TAREAS DE PROPUESTA DE TESIS SOLO 3 POR USUARIO
    await Tareas.findOrCreate({
      where: {
        curso_id: 1,
        titulo: "PROPUESTAS DE TESIS",
      },
      defaults: {
        descripcion: "SUBE TUS 3 PROPUESTAS DE TESIS",
        inicioTarea: now,
        finTarea: oneMonthLater,
      },
    });

    // CREACIÓN DE LAS TAREAS DE LOS 3 CAPÍTULOS DE PROYECTO DE GRADUACIÓN I
    await Tareas.findOrCreate({
      where: {
        curso_id: 1,
        titulo: "CAPITULO 1",
      },
      defaults: {
        descripcion: "REALIZAR EL CAPÍTULO 1 DEL PROYECTO DE GRADUACIÓN",
      },
    });
    await Tareas.findOrCreate({
      where: {
        curso_id: 1,
        titulo: "CAPITULO 2",
      },
      defaults: {
        descripcion: "REALIZAR EL CAPÍTULO 2 DEL PROYECTO DE GRADUACIÓN",
      },
    });
    await Tareas.findOrCreate({
      where: {
        curso_id: 1,
        titulo: "CAPITULO 3",
      },
      defaults: {
        descripcion: "REALIZAR EL CAPÍTULO 3 DEL PROYECTO DE GRADUACIÓN",
      },
    });

    // CREACIÓN DE LAS TAREAS DE LOS 3 CAPÍTULOS DE PROYECTO DE GRADUACIÓN II
    await Tareas.findOrCreate({
      where: {
        curso_id: 2,
        titulo: "CAPITULO 4",
      },
      defaults: {
        descripcion: "REALIZAR EL CAPÍTULO 4 DEL PROYECTO DE GRADUACIÓN",
      },
    });
    await Tareas.findOrCreate({
      where: {
        curso_id: 2,
        titulo: "CAPITULO 5",
      },
      defaults: {
        descripcion: "REALIZAR EL CAPÍTULO 5 DEL PROYECTO DE GRADUACIÓN",
      },
    });
    await Tareas.findOrCreate({
      where: {
        curso_id: 2,
        titulo: "CAPITULO 6",
      },
      defaults: {
        descripcion: "REALIZAR EL CAPÍTULO 6 DEL PROYECTO DE GRADUACIÓN",
      },
    });

    console.log(`Tablas inicializadas correctamente en la BD`);
  } catch (error) {
    console.error("Error initializing roles:", error);
  }
};

module.exports = initializetables;
