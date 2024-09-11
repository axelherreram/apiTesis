const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");  

const Year = sequelize.define("Year", {
  year_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  year: {
    type: DataTypes.INTEGER, 
    allowNull: false,
    unique: true, 
  }
}, {
  timestamps: false,
  tableName: 'year'
});

module.exports = Year;
