import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { routesAPI } from '../services/api';

function Routes() {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadRoutes();
  }, [filter]);

  const loadRoutes = async () => {
    setIsLoading(true);
    try {
      const response = await routesAPI.getAll({ status: filter !== 'all' ? filter : undefined });
      setRoutes(response.data.routes);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this route?')) {
      try {
        await routesAPI.delete(id);
        loadRoutes();
      } catch (error) {
        console.error('Error deleting route:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading routes...</div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>My Routes</h1>
        <Link to="/routes/new" className="btn btn-primary">Add New Route</Link>
      </header>

      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Routes</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {routes.length === 0 ? (
        <div className="empty-state">
          <h3>No routes found</h3>
          <p>Create your first route to get started.</p>
          <Link to="/routes/new" className="btn btn-primary">Add Route</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Route Name</th>
                <th>Bus</th>
                <th>Schedule</th>
                <th>Days</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id}>
                  <td>
                    <strong>{route.name}</strong>
                    {route.description && <small>{route.description}</small>}
                  </td>
                  <td>{route.bus?.registration_number || 'Unassigned'}</td>
                  <td>
                    {route.scheduled_start_time && route.scheduled_end_time
                      ? `${route.scheduled_start_time} - ${route.scheduled_end_time}`
                      : 'Not set'}
                  </td>
                  <td>{route.days_of_week?.join(', ') || 'Not set'}</td>
                  <td>{route.is_morning_route ? 'Morning' : 'Afternoon'}</td>
                  <td>
                    <span className={`status-badge status-${route.status}`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="actions">
                    <Link to={`/routes/${route.id}`} className="btn btn-small">View</Link>
                    <Link to={`/routes/${route.id}/edit`} className="btn btn-small">Edit</Link>
                    <button
                      onClick={() => handleDelete(route.id)}
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

export default Routes;
