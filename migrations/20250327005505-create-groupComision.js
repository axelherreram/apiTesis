'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('groupcomision', {
      group_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      year_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'year', 
          key: 'year_id',
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
      activeGroup: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable('groupcomision');
  },
};
