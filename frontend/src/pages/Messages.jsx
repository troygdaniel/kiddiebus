import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useNotificationStore from '../store/notificationStore';
import useAuthStore from '../store/authStore';

function Messages() {
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
  const { isOperator } = useAuthStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications(filter === 'unread');
  }, [filter, fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(id);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      default: return '';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'delay': return '⏰';
      case 'emergency': return '🚨';
      case 'boarding': return '🚌';
      default: return '📩';
    }
  };

  if (isLoading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Messages</h1>
        <div className="header-actions">
          {isOperator() && (
            <Link to="/messages/new" className="btn btn-primary">Send Notification</Link>
          )}
        </div>
      </header>

      <div className="messages-toolbar">
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Messages</option>
            <option value="unread">Unread Only ({unreadCount})</option>
          </select>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <h3>No messages</h3>
          <p>{filter === 'unread' ? 'You have no unread messages.' : 'You have no messages yet.'}</p>
        </div>
      ) : (
        <div className="messages-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`message-card ${notification.is_read ? '' : 'unread'} ${getPriorityClass(notification.priority)}`}
            >
              <div className="message-icon">{getTypeIcon(notification.notification_type)}</div>
              <div className="message-content">
                <div className="message-header">
                  <h3>{notification.title}</h3>
                  <span className="message-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="message-body">{notification.message}</p>
                <div className="message-meta">
                  <span className={`type-badge type-${notification.notification_type}`}>
                    {notification.notification_type}
                  </span>
                  {notification.priority !== 'normal' && (
                    <span className={`priority-badge ${getPriorityClass(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  )}
                </div>
              </div>
              <div className="message-actions">
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="btn btn-small"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="btn btn-small btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Messages;
