const { Expense } = require('../models');
const { Op } = require('sequelize');

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      description,
      userId: req.user.id, // comes from the JWT, not from the request body — important for security
    });

    res.status(201).json({ message: 'Expense created', expense });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all expenses for the logged-in user
exports.getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, sortBy, order } = req.query;

    const whereClause = { userId: req.user.id };

    if (category) {
      whereClause.category = category;
    }

    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    }

    const expenses = await Expense.findAll({
      where: whereClause,
      order: [[sortBy || 'date', order || 'DESC']],
    });

    res.status(200).json({ expenses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get a single expense by id
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({ expense });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { title, amount, category, date, description } = req.body;

    await expense.update({ title, amount, category, date, description });

    res.status(200).json({ message: 'Expense updated', expense });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.destroy();

    res.status(200).json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Summary: total spent + breakdown by category
exports.getSummary = async (req, res) => {
  try {
    const { Op, fn, col } = require('sequelize');
    const userId = req.user.id;

    // Total spent overall
    const totalResult = await Expense.findOne({
      where: { userId },
      attributes: [[fn('SUM', col('amount')), 'total']],
      raw: true,
    });

    // Breakdown by category
    const categoryBreakdown = await Expense.findAll({
      where: { userId },
      attributes: ['category', [fn('SUM', col('amount')), 'total']],
      group: ['category'],
      raw: true,
    });

    res.status(200).json({
      totalSpent: totalResult.total || 0,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Summary: monthly totals
exports.getMonthlySummary = async (req, res) => {
  try {
    const { fn, col } = require('sequelize');
    const userId = req.user.id;

    const monthlyTotals = await Expense.findAll({
      where: { userId },
      attributes: [
        [fn('DATE_FORMAT', col('date'), '%Y-%m'), 'month'],
        [fn('SUM', col('amount')), 'total'],
      ],
      group: [fn('DATE_FORMAT', col('date'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('date'), '%Y-%m'), 'DESC']],
      raw: true,
    });

    res.status(200).json({ monthlyTotals });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};