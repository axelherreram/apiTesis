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
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      approved_proposal: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          isIn: [[0, 1, 2, 3]],
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('thesissubmissions');
  },
};
