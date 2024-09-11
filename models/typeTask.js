const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");  

const typeTask = sequelize.define("typeTask", {
    typeTask_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  }
},{
  timestamps: false,
  tableName: 'typeTask'
});



module.exports = typeTask;
