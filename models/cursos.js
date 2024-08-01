const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cursos = sequelize.define("Cursos", {
  curso_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombreCurso: {
    type: DataTypes.STRING,
    allowNull: false,
  }
},{
    timestamps: false,
    tableName: 'Cursos'
}
);

module.exports = Cursos;