const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Tareas = require("./tareas");
const Usuarios = require("./usuarios")

const Entregas = sequelize.define("Entregas", {
  archivo_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  directorio: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  tarea_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Tareas,
      key: "tarea_id",
    },
  },
  user_id:
  {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuarios,
      key: "user_id",
    },
  },
  fecha_entrega: {
    type: DataTypes.DATE,
    allowNull: false,
  },
},{
    timestamps: false,
    tableName: 'Entregas'
}
);

module.exports = Entregas;