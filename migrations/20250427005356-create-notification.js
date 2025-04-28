'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notification', {
      notification_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      notification_text: {
        type: Sequelize.STRING,
        allowNull: false,
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
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'task', 
          key: 'task_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notification_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      type_notification: {
        type: Sequelize.STRING(10),
        allowNull: false,
        validate: {
          isIn: {
            args: [['student', 'general']],
            msg: "El tipo de notificación debe ser 'student' o 'general'.",
          },
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notification');
  },
};
