'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('applog', {
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
      // NORMALIZACIÓN 3NF: username eliminado (transitivo via user_id -> user.name)
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
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('applog');
  },
};
