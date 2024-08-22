const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const Usuarios = require("./usuarios");  // Asegúrate de que el modelo está correctamente importado

const Sede = sequelize.define("sede", {
  sede_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombreSede: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  }
},{
  timestamps: false,
  tableName: 'sede'
});

Usuarios.associate = function (models) {
  Sede.hasMany(models.Usuarios, { foreignKey: 'sede_id' });

}

module.exports = Sede;
