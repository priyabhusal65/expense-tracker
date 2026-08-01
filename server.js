const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const expenseRoutes = require('./routes/expenseRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Expense Tracker API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

const PORT = process.env.PORT ;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err);
  });