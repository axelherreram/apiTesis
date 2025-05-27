'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('typetask', [
      { name: "Entrega de propuesta" },
      { name: "Entrega de capitulo" }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('typetask', null, {});
  }
}; 