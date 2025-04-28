const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user");
const Task = require("./task");
/**
 * Model `Comments` represents a comment associated with a specific task and user.
 *
 * Fields:
 * - `comment_id`: Unique identifier for the comment (PK, auto-increment).
 * - `user_id`: ID of the user who posted the comment (required).
 * - `task_id`: ID of the task to which the comment belongs (required).
 * - `comment_active`: Boolean indicating whether the comment is active or not (default: true).
 *
 * Configuration:
 * - `timestamps: false`: Disables automatic `createdAt` and `updatedAt` fields.
 * - `tableName: "comments"`: Database table name (`comments`).
 *
 * Relationships:
 * - `belongsTo(User, { foreignKey: "user_id" })`: A comment belongs to a user.
 * - `belongsTo(Task, { foreignKey: "task_id" })`: A comment belongs to a task.
 */

const Comments = sequelize.define(
  "Comments",
  {
    comment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Task,
        key: "task_id",
      },
    },
    comment_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "comments",
    timestamps: false,
  }
);

module.exports = Comments;
