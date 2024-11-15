const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const rolComision = require("./rolComision");
const User = require("./user");
const Year = require("./year");
const GroupComision = require("./groupComision");

const Comisiones = sequelize.define(
  "comisiones",
  {
    comision_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    year_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Year,
        key: "year_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    rol_comision_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: rolComision,
        key: "rol_comision_id",
      },
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GroupComision,
        key: "group_id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "comisiones",
  }
);

module.exports = Comisiones;
