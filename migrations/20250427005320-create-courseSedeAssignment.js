'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
      courseActive: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('coursesedeassignment');
  },
};
