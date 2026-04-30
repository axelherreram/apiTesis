'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasksubmissions', {
      submission_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'task',
          key: 'task_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      submission_complete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // Ampliado a STRING(500) para soportar rutas largas de archivos
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // UNIQUE compuesto: evita entregas duplicadas de un mismo usuario a la misma tarea
    await queryInterface.addIndex('tasksubmissions', ['user_id', 'task_id'], {
      unique: true,
      name: 'uq_tasksubmit',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tasksubmissions');
  },
};
