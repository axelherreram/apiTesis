"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("task", {
      task_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      asigCourse_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "coursesedeassignment",
          key: "asigCourse_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      typeTask_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "typetask",
          key: "typeTask_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      taskStart: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endTask: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      year_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "year", 
          key: "year_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("task");
  },
};
