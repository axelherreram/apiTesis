const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const associateModels = require("./models/asociaciones");
const initializetables = require('./config/iniciableTables');
const authRoutes = require('./routes/authRoutes');
const { swaggerUi, swaggerDocs } = require('./docs/swagger'); 
const userRoutes = require('./routes/userRoutes');
const bitacoraRoutes = require('./routes/bitacoraRoutes');
const sedeRoutes = require('./routes/sedeRoutes');
const tareaRoutes = require('./routes/tareasRoutes');
const PropuestaTesis = require('./routes/propuestaTesisRoutes');
const rolRoutes = require('./routes/rolRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const AsignacionEstudianteRoutes = require('./routes/asignacionEstudianteRoutes');

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
app.use('/api', bitacoraRoutes);
app.use('/api', sedeRoutes);
app.use('/api', tareaRoutes);
app.use('/api', PropuestaTesis);
app.use('/api', rolRoutes);
app.use('/api', cursoRoutes);
app.use('/api', AsignacionEstudianteRoutes);

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
