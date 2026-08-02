const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { setBudget, getBudgetStatus } = require('../controllers/budgetController');

router.use(authMiddleware);

router.post('/', setBudget);
router.get('/status', getBudgetStatus);

module.exports = router;