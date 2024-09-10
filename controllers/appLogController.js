const AppLog = require('../models/appLog');

const listAllLogs = async (req, res) => {
  const { sede_id } = req.params;

  try {
    const logs = await AppLog.findAll({
      where: { sede_id },
      order: [['date', 'DESC']] // Ordenar por fecha de manera descendente
    });

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: 'No se encontraron entradas de bitácora' });
    }

    const formattedLogs = logs.map((log) => ({
      username: log.username,
      action: log.action,
      description: log.details,
      date: log.date,
    }));

    res.json({
      message: 'Lista completa de bitácoras',
      logs: formattedLogs,
    });
  } catch (err) {
    console.error('Error al listar todas las bitácoras:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};


const listLogsByUser = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const logs = await AppLog.findAll({
      where: { user_id },
      order: [['date', 'DESC']] 
    });

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: 'No se encontraron entradas de bitácora para este usuario' });
    }

    const formattedLogs = logs.map((log) => ({
      username: log.username,
      action: log.action,
      description: log.details,
      date: log.date,
    }));

    res.json({
      message: 'Lista de bitácoras',
      logs: formattedLogs,
    });
  } catch (err) {
    console.error('Error al listar las bitácoras:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};


module.exports = { listAllLogs, listLogsByUser };
