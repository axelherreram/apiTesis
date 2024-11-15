const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Api para la gestión de tesis",
      version: "1.0.1",
      description: "Documentación de la API para la gestión de tesis",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: [
            "email",
            "password",
            "name",
            "carnet",
            "sede_id",
            "rol_id",
          ],
          properties: {
            user_id: {
              type: "integer",
              description: "Auto-generated ID of the user",
            },
            email: {
              type: "string",
              description: "User's email",
            },
            password: {
              type: "string",
              description: "User's password",
            },
            name: {
              type: "string",
              description: "User's name",
            },
            carnet: {
              type: "string",
              description: "User's ID card number",
            },
            sede_id: {
              type: "integer",
              description: "ID of the user's location",
            },
            rol_id: {
              type: "integer",
              description: "ID of the user's role",
            },
            year_id: {
              type: "integer",
              description: "Year of user's registration",
            },
            profilePhoto: {
              type: "string",
              description: "User's profile photo",
            },
            active: {
              type: "boolean",
              description: "Active status of the user",
            },
            passwordUpdate: {
              type: "boolean",
              description: "Indicates if the user has updated their password",
            },
          },
          example: {
            email: "example@gmail.com",
            password: "example123",
            name: "Juan Pérez",
            carnet: "123456789",
            sede_id: 1,
            rol_id: 1,
            year_id: 2021,
          },
        },
        Bitacora: {
          type: "object",
          properties: {
            log_id: {
              type: "integer",
              description: "ID de la bitácora",
              example: 1,
            },
            user_id: {
              type: "integer",
              description:
                "ID del usuario relacionado con la entrada de la bitácora",
              example: 123,
            },
            sede_id: {
              type: "integer",
              description:
                "ID de la sede relacionada con la entrada de la bitácora",
              example: 10,
            },
            username: {
              type: "string",
              description: "Nombre de usuario que realizó la acción",
              example: "jdoe",
            },
            action: {
              type: "string",
              description: "Acción registrada en la bitácora",
              example: "Creación de usuario",
            },
            details: {
              type: "string",
              description: "Descripción detallada de la acción realizada",
              example: "El usuario creó una nueva cuenta de usuario",
            },
            date: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de la acción",
              example: "2024-11-14T15:30:00Z",
            },
          },
        },
        Comisiones: {
          type: "object",
          properties: {
            comision_id: {
              type: "integer",
              description: "ID de la comisión",
              example: 1,
            },
            year_id: {
              type: "integer",
              description: "ID del año asociado a la comisión",
              example: 2023,
            },
            user_id: {
              type: "integer",
              description: "ID del usuario en la comisión",
              example: 5,
            },
            rol_comision_id: {
              type: "integer",
              description: "ID del rol en la comisión",
              example: 2,
            },
            group_id: {
              type: "integer",
              description: "ID del grupo de la comisión",
              example: 1,
            },
          },
        },
        Curso: {
          type: "object",
          properties: {
            course_id: {
              type: "integer",
              description: "ID del curso",
              example: 1,
            },
            courseName: {
              type: "string",
              description: "Nombre del curso",
              example: "Matemáticas Avanzadas",
            },
          },
        },
        CourseSedeAssignment: {
          type: "object",
          properties: {
            asigCourse_id: {
              type: "integer",
              description: "ID de la asignación de curso a sede",
            },
            course_id: {
              type: "integer",
              description: "ID del curso",
              example: 1,
            },
            sede_id: {
              type: "integer",
              description: "ID de la sede",
              example: 1,
            },
            courseActive: {
              type: "boolean",
              description: "Estado de activación del curso",
            },
            year_id: {
              type: "integer",
              description: "ID del año académico",
              example: 2024,
            },
          },
          required: ["course_id", "sede_id"],
          example: {
            course_id: 1,
            sede_id: 1,
            year_id: 2024,
            courseActive: true,
          },
        },
        GroupComision: {
          type: "object",
          properties: {
            group_id: {
              type: "integer",
              description: "ID del grupo de comisión",
            },
            year_id: {
              type: "integer",
              description: "ID del año académico asociado al grupo",
            },
            sede_id: {
              type: "integer",
              description: "ID de la sede asociada al grupo",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación del grupo",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización del grupo",
            },
          },
        },
        Role: {
          type: "object",
          properties: {
            rol_id: {
              type: "integer",
              description: "ID único del rol",
              example: 1,
            },
            name: {
              type: "string",
              description: "Nombre del rol",
              example: "Administrador",
            },
          },
        },
        Sede: {
          type: "object",
          properties: {
            sede_id: {
              type: "integer",
              description: "ID único de la sede",
              example: 1,
            },
            nameSede: {
              type: "string",
              description: "Nombre de la sede",
              example: "Sede Centro",
            },
          },
          required: ["nameSede"],
        },
        BulkUpload: {
          type: "object",
          properties: {
            archivo: {
              type: "string",
              format: "binary",
              description: "Archivo Excel con los usuarios",
            },
            sede_id: {
              type: "integer",
              description: "ID de la sede para asignar a los usuarios",
            },
            rol_id: {
              type: "integer",
              description: "ID del rol para asignar a los usuarios",
            },
            course_id: {
              type: "integer",
              description:
                "ID del curso para asignar a los usuarios (opcional)",
            },
          },
          required: ["archivo", "sede_id", "rol_id"],
        },
        Submissions: {
          type: "object",
          properties: {
            submission_id: {
              type: "integer",
              description: "ID único de la submisión",
              example: 1,
            },
            directory: {
              type: "string",
              description: "Ruta del archivo PDF subido",
              example: "uploads/submissions/archivo.pdf",
            },
            task_id: {
              type: "integer",
              description: "ID de la tarea asociada",
              example: 1,
            },
            user_id: {
              type: "integer",
              description: "ID del usuario que realizó la submisión",
              example: 1,
            },
            submission_date: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de la submisión",
              example: "2024-09-26T14:48:00.000Z",
            },
            approved_proposal: {
              type: "integer",
              description: "Propuesta aprobada (1, 2 o 3)",
              example: 1,
            },
          },
        },
        Task: {
          type: "object",
          properties: {
            task_id: {
              type: "integer",
              description: "ID único de la tarea",
              example: 1,
            },
            course_id: {
              type: "integer",
              description: "ID del curso asociado",
              example: 1,
            },
            sede_id: {
              type: "integer",
              description: "ID de la sede asociada",
              example: 1,
            },
            typeTask_id: {
              type: "integer",
              description: "ID del tipo de tarea",
              example: 1,
            },
            title: {
              type: "string",
              description: "Título de la tarea",
              example: "CAPÍTULO 1",
            },
            description: {
              type: "string",
              description: "Descripción de la tarea",
              example: "REALIZAR EL CAPÍTULO 1 DEL PROYECTO DE GRADUACIÓN",
            },
            taskStart: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de inicio de la tarea",
              example: "2024-09-03T00:00:00Z",
            },
            endTask: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora de finalización de la tarea",
              example: "2024-09-10T00:00:00Z",
            },
            note: {
              type: "string",
              description: "Nota de la tarea",
              example: "35",
            },
          },
          required: [
            "course_id",
            "sede_id",
            "typeTask_id",
            "title",
            "description",
          ],
        },
        TimelineEventos: {
          type: "object",
          properties: {
            evento_id: {
              type: "integer",
              description: "ID único del evento en la línea de tiempo",
              example: 1,
            },
            user_id: {
              type: "integer",
              description: "ID del usuario asociado al evento",
              example: 5,
            },
            tipoEvento: {
              type: "string",
              description: "Tipo del evento registrado en la línea de tiempo",
              example: "Comentario",
            },
            descripcion: {
              type: "string",
              description: "Descripción del evento",
              example: "Comentario sobre la entrega del capítulo 1",
            },
            course_id: {
              type: "integer",
              description: "ID del curso asociado al evento",
              example: 2,
            },
            task_id: {
              type: "integer",
              description: "ID de la tarea asociada al evento (opcional)",
              example: 1,
            },
            fecha: {
              type: "string",
              format: "date-time",
              description: "Fecha y hora del evento",
              example: "2024-11-14T10:00:00Z",
            },
          },
          required: [
            "user_id",
            "tipoEvento",
            "descripcion",
            "course_id",
            "fecha",
          ],
        },
        TypeTask: {
          type: "object",
          properties: {
            typeTask_id: {
              type: "integer",
              description: "ID único del tipo de tarea",
              example: 1,
            },
            name: {
              type: "string",
              description: "Nombre del tipo de tarea",
              example: "Entrega Final",
            },
          },
          required: ["typeTask_id", "name"],
        },
        Year: {
          type: "object",
          properties: {
            year_id: {
              type: "integer",
              description: "ID único del año",
            },
            year: {
              type: "integer",
              description: "Valor del año (por ejemplo, 2024)",
            },
          },
          required: ["year"],
          example: {
            year_id: 1,
            year: 2024,
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerDocs,
};
