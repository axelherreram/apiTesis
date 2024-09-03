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
