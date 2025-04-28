'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      carnet: {
        type: Sequelize.STRING(25),
        allowNull: true,
        unique: true,
      },
      sede_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'sede', 
          key: 'sede_id',
        },
      },
      rol_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: {
          model: 'roles', 
          key: 'rol_id',
        },
      },
      year_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'year', 
          key: 'year_id',
        },
      },
      profilePhoto: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      passwordUpdate: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user');
  },
};
