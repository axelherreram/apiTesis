"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear la tabla 'sede'
    await queryInterface.createTable("sede", {
      sede_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nameSede: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
       address: {
         type: Sequelize.STRING,
         allowNull: true,
       },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("sede");
  },
};
