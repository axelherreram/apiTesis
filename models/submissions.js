const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Task = require("./task");
const User = require("./user");

const Submissions = sequelize.define("Submissions", {
  submission_id: {  // entrega_id
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  directory: {  // directorio
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  task_id: {  // tarea_id
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Task,
      key: "task_id",
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
  submission_date: {  
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,
  tableName: 'Submissions'
});

module.exports = Submissions;
