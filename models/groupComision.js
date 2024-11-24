const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Comisiones = require("./comisiones");
const Year = require("./year");
const Sede = require("./sede");

const GroupComision = sequelize.define(
  "groupComision",
  {
    group_id: {
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
    sede_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sede,
        key: "sede_id",
      },
    },
    activeGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    tableName: "groupComision",
  }
);



module.exports = GroupComision;
