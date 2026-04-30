'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('thesissubmissions', {
      thesisSubmissions_id: {
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
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      // NORMALIZACIÓN: approved_proposal convertido a ENUM semántico (antes era INTEGER 0-3)
      approved_proposal: {
        type: Sequelize.ENUM('pending', 'approved', 'needs_changes', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('thesissubmissions');
  },
};
