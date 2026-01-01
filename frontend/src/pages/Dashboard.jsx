import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import { routesAPI, studentsAPI, busesAPI } from '../services/api';

function Dashboard() {
  const { user, isOperator, isParent } = useAuthStore();
  const { notifications, unreadCount } = useNotificationStore();
  const [stats, setStats] = useState({
    routes: 0,
    students: 0,
    buses: 0,
  });
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    setRecentNotifications(notifications.slice(0, 5));
  }, [notifications]);

  const loadDashboardData = async () => {
    try {
      if (isOperator()) {
        const [routesRes, studentsRes, busesRes] = await Promise.all([
          routesAPI.getAll({ status: 'active' }),
          studentsAPI.getAll(),
          busesAPI.getAll({ status: 'active' }),
        ]);
        setStats({
          routes: routesRes.data.routes.length,
          students: studentsRes.data.students.length,
          buses: busesRes.data.buses.length,
        });
      } else if (isParent()) {
        const studentsRes = await studentsAPI.getAll();
        setStats({
          ...stats,
          students: studentsRes.data.students.length,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome back, {user?.first_name}!</h1>
        <p className="dashboard-subtitle">
          {isOperator()
            ? 'Manage your bus routes and keep parents informed'
            : 'Track your children\'s bus and stay updated'}
        </p>
      </header>

      {/* Quick Stats */}
      <section className="stats-grid">
        {isOperator() ? (
          <>
            <div className="stat-card">
              <h3>{stats.routes}</h3>
              <p>Active Routes</p>
              <Link to="/routes">View Routes</Link>
            </div>
            <div className="stat-card">
              <h3>{stats.students}</h3>
              <p>Students</p>
              <Link to="/students">View Students</Link>
            </div>
            <div className="stat-card">
              <h3>{stats.buses}</h3>
              <p>Active Buses</p>
              <Link to="/buses">View Buses</Link>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <h3>{stats.students}</h3>
              <p>My Children</p>
              <Link to="/my-children">View Children</Link>
            </div>
            <div className="stat-card">
              <h3>Track</h3>
              <p>Bus Location</p>
              <Link to="/track">Track Now</Link>
            </div>
          </>
        )}
        <div className="stat-card">
          <h3>{unreadCount}</h3>
          <p>Unread Messages</p>
          <Link to="/messages">View Messages</Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          {isOperator() ? (
            <>
              <Link to="/routes/new" className="btn btn-primary">Add Route</Link>
              <Link to="/checkin" className="btn btn-secondary">Student Check-In</Link>
              <Link to="/messages/new" className="btn btn-secondary">Send Notification</Link>
            </>
          ) : (
            <>
              <Link to="/track" className="btn btn-primary">Track My Child's Bus</Link>
              <Link to="/my-children/add" className="btn btn-secondary">Add Child</Link>
            </>
          )}
        </div>
      </section>

      {/* Recent Notifications */}
      <section className="recent-notifications">
        <h2>Recent Notifications</h2>
        {recentNotifications.length > 0 ? (
          <ul className="notification-list">
            {recentNotifications.map((notification) => (
              <li
                key={notification.id}
                className={`notification-item ${notification.is_read ? '' : 'unread'}`}
              >
                <div className="notification-content">
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-data">No notifications yet</p>
        )}
        <Link to="/messages" className="view-all-link">View All Messages</Link>
      </section>
    </div>
  );
}

export default Dashboard;
