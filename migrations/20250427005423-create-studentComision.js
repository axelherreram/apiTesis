'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('studentcomision', {
      estudiante_comision_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'groupcomision', 
          key: 'group_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('studentcomision');
  },
};
