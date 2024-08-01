const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Roles = sequelize.define("Roles", {
  rol_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombreRol: {
    type: DataTypes.STRING(200),
    allowNull: false,
  }
},{
    timestamps: false,
    tableName: 'Roles'
}
);

module.exports = Roles;