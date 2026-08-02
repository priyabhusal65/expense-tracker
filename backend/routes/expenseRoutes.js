const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getSummary,
  getMonthlySummary
} = require('../controllers/expenseController');

router.use(authMiddleware); // applies to ALL routes below this line

router.get('/summary', getSummary);
router.get('/summary/monthly', getMonthlySummary);

router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;