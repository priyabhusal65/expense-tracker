import { useState, useEffect } from 'react';
import { getSummary, getMonthlySummary } from '../api/expenseApi';
import Navbar from '../components/Navbar';

const Dashboard = () => {
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

  return (
    <div>
      <Navbar />
      <div className="page">
        <h2>Dashboard</h2>

        {loading ? (
          <p>Loading dashboard...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <>
            <div className="stat-row">
              <div className="stat-card">
                <div className="label">Total Spent</div>
                <div className="value">${summary?.totalSpent || '0.00'}</div>
              </div>
            </div>

            <div className="card">
              <h3>Spending by Category</h3>
              {summary?.categoryBreakdown?.length > 0 ? (
                <table className="ledger">
                  <tbody>
                    {summary.categoryBreakdown.map((item, index) => (
                      <tr key={index}>
                        <td><span className="tag">{item.category}</span></td>
                        <td className="amount">${item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: 'var(--slate)' }}>No expenses yet.</p>
              )}
            </div>

            <div className="card">
              <h3>Monthly Totals</h3>
              {monthly?.length > 0 ? (
                <table className="ledger">
                  <tbody>
                    {monthly.map((item, index) => (
                      <tr key={index}>
                        <td>{item.month}</td>
                        <td className="amount">${item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: 'var(--slate)' }}>No monthly data yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;