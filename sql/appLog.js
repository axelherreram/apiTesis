const AppLog = require('../models/appLog');

/**
 * Logs user activity to the AppLog model.
 *
 * Records a user's activity in the `AppLog` table.
 *
 * @param {number} user_id  - ID of the user performing the action.
 * @param {number} sede_id  - ID of the location (sede); can be null.
 * @param {string} action   - Short label of the action (e.g., "create", "update").
 * @param {string} details  - Detailed description of the action performed.
 *
 * NORMALIZACIÓN 3NF:
 * - Eliminado `username` (transitivo via user_id -> user.name).
 *   Para obtener el nombre del usuario, hacer JOIN con la tabla `user`.
 *
 * @example
 * logActivity(1, 2, 'update', 'Updated user information for user with ID 1');
 */
async function logActivity(user_id, sede_id, action, details) {
  try {
    if (!user_id || !action || !details) {
      console.error('Parámetros requeridos faltantes:', { user_id, action, details });
      return;
    }

    await AppLog.create({
      user_id,
      sede_id,
      action,
      details,
    });

    console.log('Activity logged:', { user_id, action, details });
  } catch (err) {
    console.error('Error al registrar actividad:', err);
  }
}

module.exports = { logActivity };
