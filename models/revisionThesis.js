const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const Sede = require("./sede");
const moment = require("moment-timezone");
const RevisionThesis = sequelize.define(
  "RevisionThesis",
  {
    revision_thesis_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
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
    active_process: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    date_revision: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    approval_letter_dir: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    thesis_dir: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "revisionthesis",
    timestamps: false,
  }
);

module.exports = RevisionThesis;
