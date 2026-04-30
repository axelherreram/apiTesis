'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('approvalthesis', {
      approval_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      revision_thesis_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'revisionthesis',
          key: 'revision_thesis_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      // NORMALIZACIÓN 3NF: approved BOOLEAN eliminado (redundante con status ENUM)
      date_approved: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'in revision'),
        allowNull: false,
        defaultValue: 'pending',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('approvalthesis');
  },
};
