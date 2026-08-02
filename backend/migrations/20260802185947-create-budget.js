'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Budgets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      month: {
        type: Sequelize.STRING, // format: "2026-08"
        allowNull: false,
      },
      limitAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Prevent duplicate budgets for the same user + month
    await queryInterface.addConstraint('Budgets', {
      fields: ['userId', 'month'],
      type: 'unique',
      name: 'unique_user_month_budget',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Budgets');
  },
};