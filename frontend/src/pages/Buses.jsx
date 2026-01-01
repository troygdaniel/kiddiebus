import { useEffect, useState } from 'react';
import { busesAPI } from '../services/api';

function Buses() {
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    registration_number: '',
    capacity: '',
    make: '',
    model: '',
    year: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    setIsLoading(true);
    try {
      const response = await busesAPI.getAll();
      setBuses(response.data.buses);
    } catch (error) {
      console.error('Error loading buses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      registration_number: '',
      capacity: '',
      make: '',
      model: '',
      year: '',
    });
    setEditingBus(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      registration_number: bus.registration_number,
      capacity: bus.capacity,
      make: bus.make || '',
      model: bus.model || '',
      year: bus.year || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        ...formData,
        capacity: parseInt(formData.capacity),
        year: formData.year ? parseInt(formData.year) : null,
      };

      if (editingBus) {
        await busesAPI.update(editingBus.id, data);
      } else {
        await busesAPI.create(data);
      }
      resetForm();
      loadBuses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save bus');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this bus?')) {
      try {
        await busesAPI.delete(id);
        loadBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading buses...</div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Buses</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Add New Bus
        </button>
      </header>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingBus ? 'Edit Bus' : 'Add New Bus'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="registration_number">Registration Number *</label>
                <input
                  type="text"
                  id="registration_number"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  required
                  placeholder="e.g., JA1234"
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">Capacity *</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Number of seats"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="make">Make</label>
                  <input
                    type="text"
                    id="make"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    placeholder="e.g., Toyota"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="model">Model</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., Coaster"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  placeholder="e.g., 2020"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBus ? 'Update Bus' : 'Add Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {buses.length === 0 ? (
        <div className="empty-state">
          <h3>No buses registered</h3>
          <p>Add your first bus to get started.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add Bus
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Make / Model</th>
                <th>Year</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id}>
                  <td><strong>{bus.registration_number}</strong></td>
                  <td>{bus.make} {bus.model}</td>
                  <td>{bus.year || '-'}</td>
                  <td>{bus.capacity} seats</td>
                  <td>
                    <span className={`status-badge status-${bus.status}`}>
                      {bus.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button onClick={() => handleEdit(bus)} className="btn btn-small">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bus.id)}
                      className="btn btn-small btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Buses;
