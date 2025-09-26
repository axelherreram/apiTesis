'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sedes = [
      "Amatitlán", 
      "Boca del Monte", 
      "Chinautla", 
      "La Florida, Zona 19", 
      "El Naranjo, Mixco",
      "Guastatoya", 
      "Sanarate", 
      "Chiquimula", 
      "Escuintla", 
      "Quetzaltenango"
    ];

    await queryInterface.bulkInsert('sede', sedes.map(sede => ({ nameSede: sede })), {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('sede', null, {});
  }
};
