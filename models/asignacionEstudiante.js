const Usuarios = require("./usuarios");
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
  }
);

// Definición de las asociaciones
AsignacionEstudiante.associate = function (models) {
  AsignacionEstudiante.belongsTo(models.Usuarios, {
    foreignKey: "estudiante_id",
    as: "estudiante",
  });
  AsignacionEstudiante.belongsTo(models.Usuarios, {
    foreignKey: "catedratico_id",
    as: "catedratico",
  });
};
module.exports = AsignacionEstudiante;
