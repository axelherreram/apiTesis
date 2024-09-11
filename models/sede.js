const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");  
const User = require("./user");  // Asegúrate de que el modelo está correctamente importado

const Sede = sequelize.define("sede", {
  sede_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nameSede: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  }
},{
  timestamps: false,
  tableName: 'sede'
});

User.associate = function (models) {
  Sede.hasMany(models.User, { foreignKey: 'sede_id' });

}

module.exports = Sede;
