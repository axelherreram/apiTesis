'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comisiones', {
      comision_id: {
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
        onDelete: 'RESTRICT',
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
      rol_comision_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rolComision', 
          key: 'rol_comision_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'groupcomision',
          key: 'group_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('comisiones');
  },
};
