const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const rolComision = require("./rolComision");
const Sede = require("./sede");
const User = require("./user");
const Year = require("./year");

const Comisiones = sequelize.define(
    "Comisiones",
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
        sede_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Sede,
                key: "sede_id",
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
    },
    {
        timestamps: false,
        tableName: "comisiones",
    }
);

module.exports = Comisiones;
