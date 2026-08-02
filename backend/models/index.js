const sequelize = require('../config/database');
const User = require('./user');
const Expense = require('./expense');

// A User has many Expenses
User.hasMany(Expense, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

// Each Expense belongs to a User
Expense.belongsTo(User, {
  foreignKey: 'userId',
});

module.exports = { sequelize, User, Expense };