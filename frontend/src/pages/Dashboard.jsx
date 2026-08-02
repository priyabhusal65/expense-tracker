import { useState, useEffect } from 'react';
import { getSummary, getMonthlySummary } from '../api/expenseApi';
import { getBudgetStatus, setBudget } from '../api/budgetApi';
import Navbar from '../components/Navbar';

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [budgetStatus, setBudgetStatus] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetSubmitting, setBudgetSubmitting] = useState(false);

  const currentMonth = getCurrentMonth();

  const fetchBudgetStatus = async () => {
    try {
      const data = await getBudgetStatus(currentMonth);
      setBudgetStatus(data);
    } catch (err) {
      // fail silently — budget is a nice-to-have, shouldn't break the dashboard
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryData = await getSummary();
        const monthlyData = await getMonthlySummary();
        setSummary(summaryData);
        setMonthly(monthlyData.monthlyTotals);
        await fetchBudgetStatus();
      } catch (err) {
        setError('Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!budgetInput) return;
    setBudgetSubmitting(true);

    try {
      await setBudget({ month: currentMonth, limitAmount: budgetInput });
      setBudgetInput('');
      await fetchBudgetStatus();
    } catch (err) {
      // could add error state here if you want
    } finally {
      setBudgetSubmitting(false);
    }
  };

  const monthLabel = new Date(`${currentMonth}-01`).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

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
            {/* Budget section */}
            {budgetStatus && !budgetStatus.hasBudget && (
              <div className="budget-prompt">
                <p style={{ margin: 0, fontWeight: 600 }}>
                  It's {monthLabel} — set your spending limit for this month
                </p>
                <form onSubmit={handleSetBudget}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 300"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    required
                  />
                  <button type="submit" disabled={budgetSubmitting}>
                    {budgetSubmitting ? 'Saving...' : 'Set Budget'}
                  </button>
                </form>
              </div>
            )}

            {budgetStatus && budgetStatus.hasBudget && (
              <div className={`budget-banner ${budgetStatus.status}`}>
                {budgetStatus.message}
              </div>
            )}

            <div className="stat-row">
              <div className="stat-card">
                <div className="label">Total Spent (All Time)</div>
                <div className="value">${summary?.totalSpent || '0.00'}</div>
              </div>
              {budgetStatus?.hasBudget && (
                <div className="stat-card">
                  <div className="label">{monthLabel} Budget</div>
                  <div className="value">${budgetStatus.limit}</div>
                </div>
              )}
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