const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const Comisiones = require("./Comisiones");
const User = require("./user");
const Year = require("./year");
const EstudianteComision = sequelize.define(
    "EstudianteComision",
    {
        estudiante_comision_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        comision_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Comisiones,
                key: "comision_id",
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
        year_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Year,
                key: "year_id",
            },
        },
    },
    {
        timestamps: false,
        tableName: "estudianteComision",
    }
);

module.exports = EstudianteComision;