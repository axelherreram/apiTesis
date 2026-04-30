'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courseassignment', {
      courseAssignment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      asigCourse_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'coursesedeassignment',
          key: 'asigCourse_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      note: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
      },
    });

    // UNIQUE compuesto: evita que un estudiante se inscriba dos veces al mismo curso
    await queryInterface.addIndex('courseassignment', ['student_id', 'asigCourse_id'], {
      unique: true,
      name: 'uq_courseassign',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('courseassignment');
  },
};
