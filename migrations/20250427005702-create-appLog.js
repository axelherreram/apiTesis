'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AppLog', {
      log_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',  
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      sede_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sede', 
          key: 'sede_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      action: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AppLog');
  }
};
