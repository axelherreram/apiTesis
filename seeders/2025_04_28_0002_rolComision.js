'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('rolComision', [
      { rolComisionName: "Presidente" },
      { rolComisionName: "Secretario" },
      { rolComisionName: "Vocal 1" },
      { rolComisionName: "Vocal 2" },
      { rolComisionName: "Vocal 3" }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('rolComision', null, {});
  }
};
