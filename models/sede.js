const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sede = sequelize.define("sede", {
  sede_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombreSede: {
    type: DataTypes.STRING,
    allowNull: false,
  }
},{
    timestamps: false,
    tableName: 'sede'
}
);

module.exports = Sede;