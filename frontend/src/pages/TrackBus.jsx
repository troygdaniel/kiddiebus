import { useEffect, useState } from 'react';
import { studentsAPI, routesAPI } from '../services/api';

function TrackBus() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data.students);
      if (response.data.students.length > 0) {
        handleSelectStudent(response.data.students[0]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    if (student.route_id) {
      try {
        const response = await routesAPI.getById(student.route_id);
        setRoute(response.data.route);
      } catch (error) {
        console.error('Error loading route:', error);
        setRoute(null);
      }
    } else {
      setRoute(null);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (students.length === 0) {
    return (
      <div className="page-container">
        <header className="page-header">
          <h1>Track Bus</h1>
        </header>
        <div className="empty-state">
          <h3>No children registered</h3>
          <p>Add your children to start tracking their bus.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Track Bus</h1>
      </header>

      {students.length > 1 && (
        <div className="student-selector">
          <label>Select Child:</label>
          <select
            value={selectedStudent?.id || ''}
            onChange={(e) => {
              const student = students.find((s) => s.id === parseInt(e.target.value));
              if (student) handleSelectStudent(student);
            }}
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="tracking-container">
        {/* Map Placeholder */}
        <div className="map-container">
          <div className="map-placeholder">
            <h3>Bus Location Map</h3>
            <p>Google Maps integration will be enabled in Phase 2</p>
            <p>Real-time bus tracking coming soon!</p>
          </div>
        </div>

        {/* Route Info */}
        <div className="route-info-panel">
          <h2>{selectedStudent?.full_name}'s Bus</h2>

          {route ? (
            <>
              <div className="info-card">
                <h3>Route Information</h3>
                <div className="info-row">
                  <span className="label">Route Name:</span>
                  <span className="value">{route.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Type:</span>
                  <span className="value">{route.is_morning_route ? 'Morning Pickup' : 'Afternoon Drop-off'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Schedule:</span>
                  <span className="value">
                    {route.scheduled_start_time && route.scheduled_end_time
                      ? `${route.scheduled_start_time} - ${route.scheduled_end_time}`
                      : 'Not set'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Days:</span>
                  <span className="value">
                    {route.days_of_week?.length > 0
                      ? route.days_of_week.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
                      : 'Not set'}
                  </span>
                </div>
              </div>

              {route.bus && (
                <div className="info-card">
                  <h3>Bus Details</h3>
                  <div className="info-row">
                    <span className="label">Registration:</span>
                    <span className="value">{route.bus.registration_number}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Vehicle:</span>
                    <span className="value">{route.bus.make} {route.bus.model}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`status-badge status-${route.bus.status}`}>
                      {route.bus.status}
                    </span>
                  </div>
                  {route.bus.current_location && (
                    <div className="info-row">
                      <span className="label">Last Updated:</span>
                      <span className="value">
                        {new Date(route.bus.current_location.updated_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="info-card">
                <h3>Pickup Location</h3>
                <p>{selectedStudent?.pickup_address || 'Not set'}</p>
              </div>
            </>
          ) : (
            <div className="info-card">
              <p>No route assigned to this child yet.</p>
              <p>Contact your bus operator to get assigned to a route.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackBus;
