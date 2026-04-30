'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('coursesedeassignment', {
      asigCourse_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'course',
          key: 'course_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sede_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sede',
          key: 'sede_id',
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
      // Default explícito: un curso se activa al asignarse
      courseActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    });

    // UNIQUE compuesto: evita asignar el mismo curso a la misma sede en el mismo año
    await queryInterface.addIndex('coursesedeassignment', ['course_id', 'sede_id', 'year_id'], {
      unique: true,
      name: 'uq_csassign',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('coursesedeassignment');
  },
};
