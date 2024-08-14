const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuarios = require("./usuarios");

const AsignacionEstudiante = sequelize.define(
  "AsignacionEstudiante",
  {
    asignacion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    catedratico_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuarios,
        key: "user_id",
      },
    },
    estudiante_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuarios,
        key: "user_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "AsignacionEstudiante",
    indexes: [
      {
        unique: true,
        fields: ['catedratico_id', 'estudiante_id']
      }
    ]
  }
);

module.exports = AsignacionEstudiante;
