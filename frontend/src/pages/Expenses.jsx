import { useState, useEffect } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenseApi';
import Navbar from '../components/Navbar';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '', amount: '', category: '', date: '', description: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'date',
    order: 'DESC',
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      params.sortBy = filters.sortBy;
      params.order = filters.order;

      const data = await getExpenses(params);
      setExpenses(data.expenses);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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

  if (error) return <div className="error-text">{error}</div>;

  return (
    <div>
      <Navbar />
      <div className="page">
        <div className="card">
          <h2>{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>
          {formError && <p className="error-text">{formError}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
              <input type="number" name="amount" placeholder="Amount" step="0.01" value={formData.amount} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <input type="text" name="description" placeholder="Description (optional)" value={formData.description} onChange={handleChange} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update Expense' : 'Add Expense'}
              </button>
              {editingId && (
                <button type="button" className="secondary" onClick={handleCancelEdit}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Your Expenses</h2>
          </div>

          <div className="form-row" style={{ marginBottom: '1.25rem' }}>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All categories</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Rent">Rent</option>
              <option value="Bills">Bills</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>

            <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
              <option value="date">Sort by date</option>
              <option value="amount">Sort by amount</option>
              <option value="title">Sort by title</option>
            </select>

            <select name="order" value={filters.order} onChange={handleFilterChange}>
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </div>

          {loading ? (
            <p style={{ color: 'var(--slate)' }}>Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <p>No expenses match these filters.</p>
            </div>
          ) : (
            <table className="ledger">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.title}</td>
                    <td><span className="tag">{expense.category}</span></td>
                    <td>{expense.date}</td>
                    <td style={{ color: 'var(--slate)' }}>{expense.description || '—'}</td>
                    <td className="amount" style={{ textAlign: 'right' }}>${expense.amount}</td>
                    <td>
                      <div className="actions">
                        <button className="small" onClick={() => handleEdit(expense)}>Edit</button>
                        <button className="danger" onClick={() => handleDelete(expense.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;