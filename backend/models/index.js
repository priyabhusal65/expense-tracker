const sequelize = require('../config/database');
const User = require('./user');
const Expense = require('./expense');
const Budget = require('./budget');

User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Budget, { foreignKey: 'userId', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Expense, Budget };