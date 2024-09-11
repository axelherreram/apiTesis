const { DataTypes } = require("sequelize");
const Roles = require("./roles");
const Sede = require("./sede");
const Year = require("./year");
const { sequelize } = require("../config/database");  

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    carnet: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: Roles,
        key: "rol_id",
      },
    },
    year_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Year,
        key: "year_id",
      },
    },
    profilePhoto: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    activoTerna: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
    tableName: "User",
  }
);

User.associate = function (models) {
  User.hasMany(models.CursoAsignacion, { foreignKey: "estudiante_id" });
  // Relación de muchos a uno entre usuarios y asignaciones como estudiantes
  User.hasMany(models.AsignacionEstudiante, {
    foreignKey: "estudiante_id",
    as: "asignacionesEstudiante",
  });

  User.hasMany(models.AsignacionEstudiante, {
    foreignKey: "catedratico_id",
    as: "asignacionesCatedratico",
  });

  User.belongsTo(models.Sede, { foreignKey: "sede_id", as: "sede" });
};

module.exports = User;
