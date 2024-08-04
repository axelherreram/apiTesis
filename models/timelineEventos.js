const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./usuarios");

const TimelineEventos = sequelize.define("TimelineEventos", {
  evento_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: "user_id",
    },
  },
  tipoEvento: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fecha:{
    type: DataTypes.DATE,
    allowNull: false,
  },

},{
    timestamps: false,
    tableName: 'TimelineEventos'
}
);

module.exports = TimelineEventos;