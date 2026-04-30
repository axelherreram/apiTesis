'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comisiones', {
      comision_id: {
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
      rol_comision_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rolcomision',
          key: 'rol_comision_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
    });

    // UNIQUE compuesto: evita asignación duplicada de usuario al mismo grupo con el mismo rol
    await queryInterface.addIndex('comisiones', ['group_id', 'user_id', 'rol_comision_id'], {
      unique: true,
      name: 'uq_comision',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comisiones');
  },
};
