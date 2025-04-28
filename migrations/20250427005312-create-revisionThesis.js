'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('revisionthesis', {
      revision_thesis_id: {
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
      sede_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sede', 
          key: 'sede_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      active_process: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      date_revision: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      approval_letter_dir: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      thesis_dir: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('revisionthesis');
  },
};
