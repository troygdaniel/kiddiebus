import { useEffect, useState } from 'react';
import { studentsAPI, routesAPI, busesAPI } from '../services/api';
import MapComponent from '../components/MapComponent';

function TrackBus() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [route, setRoute] = useState(null);
  const [bus, setBus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  // Poll for bus location updates every 30 seconds
  useEffect(() => {
    if (!route?.bus?.id) return;

    const pollLocation = async () => {
      try {
        const response = await busesAPI.getById(route.bus.id);
        setBus(response.data.bus);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error polling bus location:', error);
      }
    };

    // Initial fetch
    pollLocation();

    // Set up polling interval
    const interval = setInterval(pollLocation, 30000);

    return () => clearInterval(interval);
  }, [route?.bus?.id]);

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
        if (response.data.route.bus) {
          setBus(response.data.route.bus);
        }
      } catch (error) {
        console.error('Error loading route:', error);
        setRoute(null);
        setBus(null);
      }
    } else {
      setRoute(null);
      setBus(null);
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

  const hasLocation = bus?.current_location?.latitude && bus?.current_location?.longitude;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Track Bus</h1>
        {lastUpdated && (
          <span className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
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
        {/* Map */}
        <div className="map-container">
          {hasLocation ? (
            <MapComponent
              buses={bus ? [bus] : []}
              center={hasLocation ? {
                lat: bus.current_location.latitude,
                lng: bus.current_location.longitude
              } : undefined}
              zoom={15}
            />
          ) : (
            <div className="map-placeholder">
              <h3>Waiting for Bus Location</h3>
              {route ? (
                <p>The bus hasn't reported its location yet. Updates will appear automatically.</p>
              ) : (
                <p>No route assigned. Contact your bus operator.</p>
              )}
            </div>
          )}
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
              </div>

              {bus && (
                <div className="info-card">
                  <h3>Bus Details</h3>
                  <div className="info-row">
                    <span className="label">Registration:</span>
                    <span className="value">{bus.registration_number}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Vehicle:</span>
                    <span className="value">{bus.make} {bus.model}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`status-badge status-${bus.status}`}>
                      {bus.status}
                    </span>
                  </div>
                  {bus.current_location?.updated_at && (
                    <div className="info-row">
                      <span className="label">Location Update:</span>
                      <span className="value">
                        {new Date(bus.current_location.updated_at).toLocaleString()}
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
