const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");

/**
 * Model `Sede` represents a location or campus in the system.
 *
 * Fields:
 * - `sede_id`: Unique identifier for the location (Primary Key, auto-increment).
 * - `nameSede`: Name of the location (e.g., "Main Campus"). It is unique and cannot be null.
 *
 * Configuration:
 * - `timestamps: false`: No automatic creation of `createdAt` or `updatedAt` fields.
 * - `tableName: 'sede'`: The table in the database where this model is stored (`sede`).
 *
 * Associations:
 * - `Sede.hasMany(User)`: A single `Sede` can have many `User` entries. The `foreignKey` used for the relationship is `sede_id`.
 */
const Sede = sequelize.define(
  "sede",
  {
    sede_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nameSede: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "sede",
  }
);

User.associate = function (models) {
  Sede.hasMany(models.User, { foreignKey: "sede_id" });
};

module.exports = Sede;
