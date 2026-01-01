import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { routesAPI, busesAPI } from '../services/api';

function RouteForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [buses, setBuses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bus_id: '',
    start_location: '',
    end_location: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    days_of_week: [],
    is_morning_route: true,
    status: 'active',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const daysOptions = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  useEffect(() => {
    loadBuses();
    if (isEdit) {
      loadRoute();
    }
  }, [id]);

  const loadBuses = async () => {
    try {
      const response = await busesAPI.getAll({ status: 'active' });
      setBuses(response.data.buses);
    } catch (error) {
      console.error('Error loading buses:', error);
    }
  };

  const loadRoute = async () => {
    try {
      const response = await routesAPI.getById(id);
      const route = response.data.route;
      setFormData({
        name: route.name || '',
        description: route.description || '',
        bus_id: route.bus_id || '',
        start_location: route.start_location || '',
        end_location: route.end_location || '',
        scheduled_start_time: route.scheduled_start_time || '',
        scheduled_end_time: route.scheduled_end_time || '',
        days_of_week: route.days_of_week || [],
        is_morning_route: route.is_morning_route,
        status: route.status || 'active',
      });
    } catch (error) {
      console.error('Error loading route:', error);
      setError('Failed to load route');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'days_of_week') {
      setFormData((prev) => ({
        ...prev,
        days_of_week: checked
          ? [...prev.days_of_week, value]
          : prev.days_of_week.filter((d) => d !== value),
      }));
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        bus_id: formData.bus_id || null,
      };

      if (isEdit) {
        await routesAPI.update(id, data);
      } else {
        await routesAPI.create(data);
      }
      navigate('/routes');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save route');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{isEdit ? 'Edit Route' : 'Add New Route'}</h1>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="name">Route Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Kingston Morning Route"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of this route"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bus_id">Assigned Bus</label>
          <select
            id="bus_id"
            name="bus_id"
            value={formData.bus_id}
            onChange={handleChange}
          >
            <option value="">Select a bus</option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.registration_number} - {bus.make} {bus.model} (Capacity: {bus.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_location">Start Location</label>
            <input
              type="text"
              id="start_location"
              name="start_location"
              value={formData.start_location}
              onChange={handleChange}
              placeholder="Starting point address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_location">End Location</label>
            <input
              type="text"
              id="end_location"
              name="end_location"
              value={formData.end_location}
              onChange={handleChange}
              placeholder="Ending point address"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="scheduled_start_time">Start Time</label>
            <input
              type="time"
              id="scheduled_start_time"
              name="scheduled_start_time"
              value={formData.scheduled_start_time}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="scheduled_end_time">End Time</label>
            <input
              type="time"
              id="scheduled_end_time"
              name="scheduled_end_time"
              value={formData.scheduled_end_time}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Days of Week</label>
          <div className="checkbox-group">
            {daysOptions.map((day) => (
              <label key={day} className="checkbox-label">
                <input
                  type="checkbox"
                  name="days_of_week"
                  value={day}
                  checked={formData.days_of_week.includes(day)}
                  onChange={handleChange}
                />
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_morning_route"
              checked={formData.is_morning_route}
              onChange={handleChange}
            />
            This is a morning pickup route
          </label>
        </div>

        {isEdit && (
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/routes')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Route' : 'Create Route'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RouteForm;
