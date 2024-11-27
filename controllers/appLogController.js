const AppLog = require('../models/appLog');
const Roles = require('../models/roles');
const User = require('../models/user');

const listAllLogs = async (req, res) => {
  const { sede_id: requestSedeId } = req.params; // Sede desde el parámetro de la solicitud
  const { sede_id: tokenSedeId } = req; // Sede extraída del token

  try {
    // Validar si la sede del token coincide con la sede de la solicitud
    if (parseInt(requestSedeId, 10) !== parseInt(tokenSedeId, 10)) {
      return res
        .status(403)
        .json({ message: 'No tienes acceso a los registros de esta sede' });
    }

    // Obtener los registros de bitácora para la sede
    const logs = await AppLog.findAll({
      where: { sede_id: requestSedeId },
      order: [['date', 'DESC']],
    });

    if (!logs || logs.length === 0) {
      return res
        .status(404)
        .json({ message: 'No se encontraron entradas de bitácora' });
    }

    const formattedLogs = await Promise.all(
      logs.map(async (log) => {
        const user = await User.findOne({ where: { user_id: log.user_id } });
        const Role = await Roles.findOne({ where: { rol_id: user.rol_id } });

        return {
          user_id: log.user_id,
          username: user ? user.name : 'Usuario desconocido',
          role: Role ? Role.name : 'Rol desconocido',
          action: log.action,
          description: log.details,
          date: log.date,
        };
      })
    );

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
  const carnet = req.params.carnet;

  try {

    const user = await User.findOne({ where: { carnet } });
    if(!user){
      return res.status(404).json({ message: 'No se encontró el usuario' });
    }

    const user_id = user.user_id;

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
