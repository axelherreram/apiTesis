const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ciclos = sequelize.define("Ciclos", {
  ciclo_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombreCiclo: {
    type: DataTypes.STRING,
    allowNull: false,
  }
},{
    timestamps: false,
    tableName: 'Ciclos'
}
);

module.exports = Ciclos;