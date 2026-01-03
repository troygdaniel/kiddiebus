import { Link, useNavigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import { useEffect } from 'react';

function Layout() {
  const { user, logout, isOperator } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">Kiddie Bus</Link>
        </div>
        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">Home</Link>

          {isOperator() ? (
            <>
              <Link to="/dashboard/routes" className="nav-link">My Routes</Link>
              <Link to="/dashboard/buses" className="nav-link">Buses</Link>
              <Link to="/dashboard/schools" className="nav-link">Schools</Link>
              <Link to="/dashboard/students" className="nav-link">Students</Link>
              <Link to="/dashboard/checkin" className="nav-link">Check-In</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard/my-children" className="nav-link">My Children</Link>
              <Link to="/dashboard/track" className="nav-link">Track Bus</Link>
            </>
          )}

          <Link to="/dashboard/messages" className="nav-link">
            Messages
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </Link>
          <Link to="/dashboard/profile" className="nav-link">Profile</Link>
        </div>
        <div className="navbar-user">
          <span className="user-name">{user?.first_name} ({user?.role})</span>
          <button onClick={handleLogout} className="btn btn-logout">Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2024 Kiddie Bus - Safe School Transportation</p>
      </footer>
    </div>
  );
}

export default Layout;
