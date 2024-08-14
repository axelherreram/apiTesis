const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
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

const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
}));


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

sequelize.sync({ alter: true, force: false })
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
