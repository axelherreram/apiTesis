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
      // NORMALIZACIÓN 3NF: year_id eliminado (transitivo via group_id -> groupcomision.year_id)
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
    });

    // UNIQUE compuesto: evita inscripción duplicada de estudiante al mismo grupo
    await queryInterface.addIndex('studentcomision', ['group_id', 'user_id'], {
      unique: true,
      name: 'uq_studentcomision',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('studentcomision');
  },
};
