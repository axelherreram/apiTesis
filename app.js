const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./config/database'); 
const associateModels = require("./models/asociaciones");
const initializetables = require('./config/iniciableTables');
const authRoutes = require('./routes/authRoutes');
const { swaggerUi, swaggerDocs } = require('./docs/swagger'); 
const userRoutes = require('./routes/userRoutes');
const AppLogRoutes = require('./routes/appLogRoutes');
const sedeRoutes = require('./routes/sedeRoutes');
const TaskRoutes = require('./routes/taskRoutes');
const ThesisProposalRoutes = require('./routes/thesisProposalRoutes');
const rolRoutes = require('./routes/rolRoutes');
const CourseRoutes = require('./routes/CourseRoutes');
const studentAssignmentRoutes = require('./routes/studentAssignmentRoutes');
const TernasRoutes = require('./routes/ternaRoutes');
const StudentRoutes = require('./routes/studentRoutes');
const typeTaskRoutes = require('./routes/typeTaskRoute');
const CourseSedeAssignmentRoutes = require('./routes/courseSedeAssignmentRoutes');
const YearRoutes = require('./routes/yearRoutes')
const ternaAsignGroupRoutes = require('./routes/ternaAsignGroupRoutes');
const GroupTernaRoutes = require('./routes/groupTernaRoutes');
const professorRoutes = require('./routes/professorRoutes');
const TimeLineRoutes = require('./routes/timeLineRoutes');

const path = require('path');
const cors = require('cors');

require('dotenv').config();

const app = express();
associateModels();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
}));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', AppLogRoutes);
app.use('/api', sedeRoutes);
app.use('/api', TaskRoutes);
app.use('/api', ThesisProposalRoutes);
app.use('/api', rolRoutes);
app.use('/api', CourseRoutes);
app.use('/api', studentAssignmentRoutes);
app.use('/api', TernasRoutes);
app.use('/api', StudentRoutes);
app.use('/api', typeTaskRoutes);
app.use('/api', CourseSedeAssignmentRoutes);
app.use('/api', YearRoutes)
app.use('/api', ternaAsignGroupRoutes);
app.use('/api', GroupTernaRoutes);
app.use('/api', professorRoutes);
app.use('/api', TimeLineRoutes);



sequelize.sync({ alter: false, force: false })
  .then(async () => {
    console.log('Base de datos sincronizada');
    await initializetables(); 
    app.listen(3000, () => {
      console.log('Servidor ejecutándose en el puerto 3000');
    });
  })
  .catch(error => {
    console.log('Error al conectar con la base de datos', error);
  });
