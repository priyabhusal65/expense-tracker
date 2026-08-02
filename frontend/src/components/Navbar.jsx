import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="navbar">
      <span className="brand">Ledger</span>
      <nav>
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/expenses" className={location.pathname === '/expenses' ? 'active' : ''}>
          Expenses
        </Link>
        <a href="#" onClick={logout} style={{ marginLeft: '1.5rem', color: 'var(--gold)' }}>
          {user?.name} · Logout
        </a>
      </nav>
    </div>
  );
};

export default Navbar;