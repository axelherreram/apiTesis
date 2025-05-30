/**
 * @file app.js
 * @description Main file that initializes the Express application, configures middleware, routes, and connects to the database.
 * 
 * This file sets up the Express server, configures the middleware for handling requests and responses, and integrates routes for different parts of the application.
 * It also manages the connection to the database and initializes tables, as well as setting up Swagger for API documentation.
 * 
 * Key Components:
 * - **CORS** configuration to allow cross-origin requests from specific domains.
 * - **Body Parser** to parse incoming request bodies in JSON format.
 * - **Swagger** to provide API documentation at the `/api-docs` endpoint.
 * - **Routes** for various entities such as authentication, users, tasks, courses, and more.
 * - **Database Synchronization** to ensure the database is in sync with models before starting the server.
 * 
 * @requires express
 * @requires body-parser
 * @requires cors
 * @requires path
 * @requires dotenv
 * @requires sequelize
 * @requires models
 * @requires routes
 * @requires swagger
 */

const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./config/database'); 
const associateModels = require("./models/asociaciones");
const authRoutes = require('./routes/authRoutes');
const { swaggerUi, swaggerDocs } = require('./docs/swagger'); 
const userRoutes = require('./routes/userRoutes');
const AppLogRoutes = require('./routes/appLogRoutes');
const sedeRoutes = require('./routes/sedeRoutes');
const TaskRoutes = require('./routes/taskRoutes');
const rolRoutes = require('./routes/rolRoutes');
const CourseRoutes = require('./routes/CourseRoutes');
const StudentRoutes = require('./routes/studentRoutes');
const typeTaskRoutes = require('./routes/typeTaskRoute');
const CourseSedeAssignmentRoutes = require('./routes/courseSedeAssignmentRoutes');
const YearRoutes = require('./routes/yearRoutes');
const ThesisProposalRoutes = require('./routes/thesisProposalRoutes');
const professorRoutes = require('./routes/professorRoutes');
const TimeLineRoutes = require('./routes/timeLineRoutes');
const GroupComisionRoutes = require('./routes/groupComisionRoutes');
const comisionRoutes = require('./routes/comisionRoutes');
const StudianteComision = require('./routes/studentComisionRoutes');
const SearchRoutes = require('./routes/searchRoutes');
const CommentRoutes = require('./routes/commentRoutes');
const thesisSubmissionsRoutes = require('./routes/thesisSubmissionsRoutes'); 
const TaskSubmissionRoutes = require('./routes/taskSubmissionsRoutes'); 
const GraphicsRoutes = require('./routes/graphicRoutes'); 
const notificationRoutes = require('./routes/notificationRoutes');
const updateNoteRoutes = require('./routes/updateNoteRoutes');
const createCorSedeRoutes = require('./routes/createCorSedeRoutes');
const rateLimit = require('express-rate-limit');

const RevisoresThesisRoutes = require('./routes/revisoresThesisRoutes');
const RevisionThesisRoutes = require('./routes/revisionThesisRoutes');
const AssignedReviewRoutes = require('./routes/assignedReviewRoutes');
const GraphicThesisRoutes = require('./routes/graphicThesisRoutes');
const CommentRevision = require('./routes/commentRevisionRoutes');

const morgan = require('morgan');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

const app = express();

/* // Configure rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter); */

// Asociar modelos
associateModels();

// Configurar CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5500',
  'http://localhost:3000', 
  process.env.APP_PRODUCTION,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Configurar body-parser para analizar JSON
app.use(bodyParser.json());

// Configurar Morgan para el registro de solicitudes HTTP
// app.use(morgan('dev'));

// middleware para loggear las solicitudes manuales
/* app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Body:", req.body);
  console.log("Headers:", req.headers);
  next();
});
 */
// Servir archivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));



// Configurar Swagger para la documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Definir rutas de la API
app.use('/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', AppLogRoutes);
app.use('/api', sedeRoutes);
app.use('/api', TaskRoutes);
app.use('/api', rolRoutes);
app.use('/api', CourseRoutes);
app.use('/api', StudentRoutes);
app.use('/api', typeTaskRoutes);
app.use('/api', CourseSedeAssignmentRoutes);
app.use('/api', YearRoutes);
app.use('/api', ThesisProposalRoutes);
app.use('/api', professorRoutes);
app.use('/api', TimeLineRoutes);
app.use('/api', GroupComisionRoutes);
app.use('/api', comisionRoutes);
app.use('/api', StudianteComision);
app.use('/api', SearchRoutes);
app.use('/api', CommentRoutes);
app.use('/api', thesisSubmissionsRoutes);
app.use('/api', TaskSubmissionRoutes);
app.use('/api', GraphicsRoutes);
app.use('/api', notificationRoutes);
app.use('/api', RevisoresThesisRoutes);
app.use('/api', RevisionThesisRoutes);
app.use('/api', AssignedReviewRoutes);
app.use('/api', GraphicThesisRoutes);
app.use('/api', CommentRevision);
app.use('/api', updateNoteRoutes);
app.use('/api', createCorSedeRoutes);

// Sincronizar la base de datos y arrancar el servidor
sequelize.sync({ alter: false, force: false })
  .then(async () => {
    console.log('Base de datos sincronizada');
    app.listen(3000, () => {
      console.log('Servidor ejecutándose en el puerto 3000', 'http://localhost:3000/api-docs');
    });
  })
  .catch(error => {
    console.log('Error al conectar con la base de datos', error);
  });
