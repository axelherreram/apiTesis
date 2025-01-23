const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Comments = sequelize.define(
  "Comments",
  {
    comment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    task_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  },
  {
    tableName: "comments",
    timestamps: false,
  }
);

module.exports = Comments;
