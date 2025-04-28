'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('commentversion', {
      commentVersion_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      datecomment: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'comments', 
          key: 'comment_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', 
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('commentversion');
  },
};
