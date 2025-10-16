'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('course', [
      { courseName: "Proyecto De Graduación I" },
      { courseName: "Proyecto De Graduación II" }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('course', null, {});
  }
};
