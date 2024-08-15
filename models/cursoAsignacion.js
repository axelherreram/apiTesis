const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuarios = require("./usuarios");
const Cursos = require("./cursos");

const CursoAsignacion = sequelize.define(
  "CursoAsignacion",
  {
    asignacionCurso_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    estudiante_id:{
        type: DataTypes.INTEGER,
        references: {
            model: Usuarios,
            key: "user_id",
        },
    },
    curso_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Cursos,
        key: "curso_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "CursoAsignacion",
  }
);

CursoAsignacion.associate = function(models) {
  CursoAsignacion.belongsTo(models.Usuarios, { foreignKey: 'estudiante_id' });
  CursoAsignacion.belongsTo(models.Cursos, { foreignKey: 'curso_id' });
};

module.exports = CursoAsignacion;