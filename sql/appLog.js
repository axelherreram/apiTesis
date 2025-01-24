/**
 * Logs user activity to the AppLog model.
 * 
 * This function is responsible for recording a user's activity into the `AppLog` model. It creates a new log entry in the database, including details about the user performing the action, the action taken, and additional information provided.
 * 
 * @param {number} user_id - The ID of the user performing the action.
 * @param {number} sede_id - The ID of the location (sede) where the action is performed.
 * @param {string} username - The username of the user performing the action.
 * @param {string} action - The action being performed (e.g., "create", "update", "delete").
 * @param {string} details - A detailed description of the action performed.
 * 
 * @throws {Error} - If any required parameter is missing, or if there is an issue with creating the log entry, an error will be logged to the console.
 * 
 * @example
 * // Example usage of the logActivity function:
 * logActivity(1, 2, 'admin', 'update', 'Updated user information for user with ID 1');
 * 
 * The function will create a new record in the AppLog table, including the user_id, sede_id, username, action, and details.
 */
const AppLog = require('../models/appLog');  

async function logActivity(user_id, sede_id, username, action, details) {  
  try {
    if (!user_id || !username || !action || !details) {
      console.error('Undefined or null parameters:', { user_id, action, details });
      return;
    }

    await AppLog.create({
      user_id,
      sede_id,  
      username, 
      action,  
      details, 
    });
    console.log('Activity logged:', { user_id, username, action, details });
  } catch (err) {
    console.error('Error:', err);
  }
}

module.exports = { logActivity };  
