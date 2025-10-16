const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./user");
const Year = require("./year");
const GroupComision = require("./groupComision");

/**
 * Model `studentComision` represents the assignment of a student to a specific group of a commission for a particular year.
 * 
 * Fields:
 * - `estudiante_comision_id`: Unique identifier for the student-group commission assignment (PK, auto-increment).
 * - `group_id`: Foreign key referencing the `GroupComision` model, representing the commission group assigned to the student.
 * - `user_id`: Foreign key referencing the `User` model, representing the student assigned to the commission group.
 * - `year_id`: Foreign key referencing the `Year` model, representing the academic year of the assignment.
 * 
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: 'studentComision'`: Database table name (`studentComision`).
 */
const studentComision = sequelize.define(
    "studentComision",
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
        tableName: "studentcomision",
    }
);

module.exports = studentComision;