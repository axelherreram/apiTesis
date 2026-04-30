'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('task', {
      task_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      asigCourse_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'coursesedeassignment',
          key: 'asigCourse_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      typeTask_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'typetask',
          key: 'typeTask_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      // NORMALIZACIÓN 3NF: taskStart y endTask como DATE (= DATETIME en MySQL, Sequelize v6).
      // Eliminados: year_id (transitivo via asigCourse_id), startTime, endTime.
      taskStart: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endTask: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('task');
  },
};
