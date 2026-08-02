import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSummary, getMonthlySummary } from '../api/expenseApi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summaryData = await getSummary();
        const monthlyData = await getMonthlySummary();
        setSummary(summaryData);
        setMonthly(monthlyData.monthlyTotals);
      } catch (err) {
        setError('Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Welcome, {user?.name}!</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <nav>
        <Link to="/dashboard">Dashboard</Link> | <Link to="/expenses">Expenses</Link>
      </nav>

      <h3>Total Spent: ${summary?.totalSpent || 0}</h3>

      <h3>Spending by Category</h3>
      {summary?.categoryBreakdown?.length > 0 ? (
        <ul>
          {summary.categoryBreakdown.map((item, index) => (
            <li key={index}>
              {item.category}: ${item.total}
            </li>
          ))}
        </ul>
      ) : (
        <p>No expenses yet.</p>
      )}

      <h3>Monthly Totals</h3>
      {monthly?.length > 0 ? (
        <ul>
          {monthly.map((item, index) => (
            <li key={index}>
              {item.month}: ${item.total}
            </li>
          ))}
        </ul>
      ) : (
        <p>No monthly data yet.</p>
      )}
    </div>
  );
};

export default Dashboard;