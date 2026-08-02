const { Budget, Expense } = require('../models');
const { Op, fn, col } = require('sequelize');

// Set or update the budget for a given month
exports.setBudget = async (req, res) => {
  try {
    const { month, limitAmount } = req.body;
    const userId = req.user.id;

    if (!month || !limitAmount) {
      return res.status(400).json({ message: 'Month and limitAmount are required' });
    }

    // Check if a budget already exists for this user + month
    let budget = await Budget.findOne({ where: { userId, month } });

    if (budget) {
      await budget.update({ limitAmount });
    } else {
      budget = await Budget.create({ userId, month, limitAmount });
    }

    res.status(200).json({ message: 'Budget saved', budget });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get budget status for a given month: limit, spent, remaining, and a message
exports.getBudgetStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query; // e.g. "2026-08"

    if (!month) {
      return res.status(400).json({ message: 'Month query param is required' });
    }

    const budget = await Budget.findOne({ where: { userId, month } });

    // Calculate total spent this month
    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // safe upper bound, MySQL handles short months fine here

    const spentResult = await Expense.findOne({
      where: {
        userId,
        date: { [Op.between]: [startDate, endDate] },
      },
      attributes: [[fn('SUM', col('amount')), 'total']],
      raw: true,
    });

    const spent = parseFloat(spentResult.total) || 0;

    if (!budget) {
      return res.status(200).json({
        hasBudget: false,
        spent,
      });
    }

    const limit = parseFloat(budget.limitAmount);
    const remaining = limit - spent;
    const percentUsed = (spent / limit) * 100;

    let status = 'good'; // good, warning, over
    let message = '';

    if (spent > limit) {
      status = 'over';
      message = `You've gone over your budget by $${(spent - limit).toFixed(2)}. Consider slowing down spending for the rest of the month.`;
    } else if (percentUsed >= 80) {
      status = 'warning';
      message = `You've used ${percentUsed.toFixed(0)}% of your budget. $${remaining.toFixed(2)} left for the month.`;
    } else {
      status = 'good';
      message = `Nice work! You've only spent $${spent.toFixed(2)} of your $${limit.toFixed(2)} budget. Keep it up.`;
    }

    res.status(200).json({
      hasBudget: true,
      limit,
      spent,
      remaining,
      percentUsed,
      status,
      message,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};