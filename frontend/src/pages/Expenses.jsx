import { useState, useEffect } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenseApi';
import { Link } from 'react-router-dom';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '', amount: '', category: '', date: '', description: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null); // tracks which expense is being edited

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data.expenses);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingId) {
        await updateExpense(editingId, formData);
        setEditingId(null);
      } else {
        await createExpense(formData);
      }
      setFormData({ title: '', amount: '', category: '', date: '', description: '' });
      fetchExpenses();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', amount: '', category: '', date: '', description: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  if (loading) return <div>Loading expenses...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <nav>
        <Link to="/dashboard">Dashboard</Link> | <Link to="/expenses">Expenses</Link>
      </nav>

      <h2>{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>
      {formError && <p style={{ color: 'red' }}>{formError}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
        <input type="number" name="amount" placeholder="Amount" step="0.01" value={formData.amount} onChange={handleChange} required />
        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        <input type="text" name="description" placeholder="Description (optional)" value={formData.description} onChange={handleChange} />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : editingId ? 'Update Expense' : 'Add Expense'}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancelEdit}>Cancel</button>
        )}
      </form>

      <h2>Your Expenses</h2>

      {expenses.length === 0 ? (
        <p>No expenses yet. Add your first one!</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Title</th><th>Amount</th><th>Category</th><th>Date</th><th>Description</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.title}</td>
                <td>${expense.amount}</td>
                <td>{expense.category}</td>
                <td>{expense.date}</td>
                <td>{expense.description || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(expense)}>Edit</button>
                  <button onClick={() => handleDelete(expense.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Expenses;