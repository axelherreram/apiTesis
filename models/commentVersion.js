const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const CommentVersion = sequelize.define(
  "CommentVersion",
  {
    commentVersion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    datecomment: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [["student", "teacher"]],
          msg: "El rol debe ser 'student' o 'teacher'",
        },
      },
    },
    comment_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Comments",
        key: "comment_id",
      },
    },
  },
  {
    tableName: "commentVersion",
    timestamps: false,
    hooks: {
      beforeCreate: (commentVersion, options) => {
        // Ajustar la fecha a la zona horaria correcta
        const currentDate = new Date();
        commentVersion.datecomment = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);
      },
    },
  }
);

module.exports = CommentVersion;