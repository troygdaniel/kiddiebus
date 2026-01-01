import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, routesAPI } from '../services/api';
import useNotificationStore from '../store/notificationStore';

function SendNotification() {
  const navigate = useNavigate();
  const { sendNotification, broadcastNotification } = useNotificationStore();

  const [mode, setMode] = useState('individual'); // individual or broadcast
  const [parents, setParents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [formData, setFormData] = useState({
    recipient_id: '',
    title: '',
    message: '',
    notification_type: 'general',
    priority: 'normal',
    delivery_method: 'in_app',
    route_id: '',
    recipient_role: 'parent',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [parentsRes, routesRes] = await Promise.all([
        usersAPI.getAll('parent'),
        routesAPI.getAll({ status: 'active' }),
      ]);
      setParents(parentsRes.data.users);
      setRoutes(routesRes.data.routes);
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'individual') {
        await sendNotification({
          recipient_id: parseInt(formData.recipient_id),
          title: formData.title,
          message: formData.message,
          notification_type: formData.notification_type,
          priority: formData.priority,
          delivery_method: formData.delivery_method,
        });
      } else {
        await broadcastNotification({
          title: formData.title,
          message: formData.message,
          notification_type: formData.notification_type,
          priority: formData.priority,
          delivery_method: formData.delivery_method,
          recipient_role: formData.recipient_role,
          route_id: formData.route_id ? parseInt(formData.route_id) : null,
        });
      }
      navigate('/messages');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Send Notification</h1>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="mode-toggle">
        <button
          className={`toggle-btn ${mode === 'individual' ? 'active' : ''}`}
          onClick={() => setMode('individual')}
        >
          Individual
        </button>
        <button
          className={`toggle-btn ${mode === 'broadcast' ? 'active' : ''}`}
          onClick={() => setMode('broadcast')}
        >
          Broadcast
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        {mode === 'individual' ? (
          <div className="form-group">
            <label htmlFor="recipient_id">Recipient *</label>
            <select
              id="recipient_id"
              name="recipient_id"
              value={formData.recipient_id}
              onChange={handleChange}
              required
            >
              <option value="">Select parent</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.first_name} {parent.last_name} ({parent.email})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="recipient_role">Send To</label>
              <select
                id="recipient_role"
                name="recipient_role"
                value={formData.recipient_role}
                onChange={handleChange}
              >
                <option value="parent">All Parents</option>
                <option value="operator">All Operators</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="route_id">Filter by Route (Optional)</label>
              <select
                id="route_id"
                name="route_id"
                value={formData.route_id}
                onChange={handleChange}
              >
                <option value="">All Routes</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
              <small>Only send to parents with children on this route</small>
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Notification title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Enter your message"
            rows={5}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="notification_type">Type</label>
            <select
              id="notification_type"
              name="notification_type"
              value={formData.notification_type}
              onChange={handleChange}
            >
              <option value="general">General</option>
              <option value="delay">Delay</option>
              <option value="emergency">Emergency</option>
              <option value="boarding">Boarding Update</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="delivery_method">Delivery Method</label>
          <select
            id="delivery_method"
            name="delivery_method"
            value={formData.delivery_method}
            onChange={handleChange}
          >
            <option value="in_app">In-App Only</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
            <option value="all">All Channels</option>
          </select>
          <small>Note: SMS and Email require external service configuration</small>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/messages')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Sending...' : mode === 'broadcast' ? 'Send to All' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SendNotification;
