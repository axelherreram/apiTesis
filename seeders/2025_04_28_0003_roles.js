'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Roles', [
      { name: "Estudiante" },
      { name: "Catedrático" },
      { name: "Administrador" },
      { name: "Coordinador Sede" },
      { name: "Coordinador general" },
      { name: "Coordinador de tesis" },
      { name: "Revisor" }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
