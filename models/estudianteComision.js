const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./user");
const Year = require("./year");
const GroupComision = require("./groupComision");

const EstudianteComision = sequelize.define(
    "estudianteComision",
    {
        estudiante_comision_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: GroupComision,
                key: "group_id",
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