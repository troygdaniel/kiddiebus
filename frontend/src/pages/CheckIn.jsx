import { useState, useEffect } from 'react';
import { studentsAPI, busesAPI, routesAPI } from '../services/api';

function CheckIn() {
  const [cardId, setCardId] = useState('');
  const [student, setStudent] = useState(null);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [boardingType, setBoardingType] = useState('pickup');
  const [recentBoardings, setRecentBoardings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [busesRes, routesRes] = await Promise.all([
        busesAPI.getAll({ status: 'active' }),
        routesAPI.getAll({ status: 'active' }),
      ]);
      setBuses(busesRes.data.buses);
      setRoutes(routesRes.data.routes);
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setStudent(null);
    setIsLoading(true);

    try {
      const response = await studentsAPI.getByCard(cardId.toUpperCase());
      setStudent(response.data.student);

      // Auto-select route if student has one
      if (response.data.student.route_id) {
        setSelectedRoute(response.data.student.route_id.toString());
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Student not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!student || !selectedBus) {
      setError('Please select a bus');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await studentsAPI.checkin(student.id, {
        bus_id: parseInt(selectedBus),
        route_id: selectedRoute ? parseInt(selectedRoute) : student.route_id,
        boarding_type: boardingType,
        verification_method: 'card',
      });

      setSuccess(`${student.full_name} has been checked in for ${boardingType}!`);
      setRecentBoardings([response.data.boarding, ...recentBoardings.slice(0, 9)]);

      // Reset for next student
      setCardId('');
      setStudent(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = async () => {
    // For manual check-in without card
    setError('');
    setSuccess('');
    setStudent(null);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Student Check-In</h1>
      </header>

      <div className="checkin-container">
        <div className="checkin-main">
          {/* Search Section */}
          <section className="checkin-search">
            <h2>Scan or Enter Card ID</h2>
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <input
                  type="text"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value.toUpperCase())}
                  placeholder="Enter card ID (e.g., A1B2C3D4)"
                  className="card-input"
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" disabled={isLoading || !cardId}>
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
          </section>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Student Info */}
          {student && (
            <section className="student-info-card">
              <h2>Student Found</h2>
              <div className="student-details-large">
                <div className="detail-row">
                  <span className="label">Name:</span>
                  <span className="value">{student.full_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Grade:</span>
                  <span className="value">{student.grade || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">School:</span>
                  <span className="value">{student.school_name || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Card ID:</span>
                  <span className="value card-id-display">{student.card_id}</span>
                </div>
              </div>

              {/* Check-in Form */}
              <div className="checkin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Bus *</label>
                    <select
                      value={selectedBus}
                      onChange={(e) => setSelectedBus(e.target.value)}
                      required
                    >
                      <option value="">Select bus</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          {bus.registration_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Route</label>
                    <select
                      value={selectedRoute}
                      onChange={(e) => setSelectedRoute(e.target.value)}
                    >
                      <option value="">Select route</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Boarding Type</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="boardingType"
                        value="pickup"
                        checked={boardingType === 'pickup'}
                        onChange={(e) => setBoardingType(e.target.value)}
                      />
                      Pickup (Morning)
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="boardingType"
                        value="dropoff"
                        checked={boardingType === 'dropoff'}
                        onChange={(e) => setBoardingType(e.target.value)}
                      />
                      Drop-off (Afternoon)
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleCheckIn}
                  className="btn btn-primary btn-large"
                  disabled={isLoading || !selectedBus}
                >
                  {isLoading ? 'Processing...' : `Confirm ${boardingType === 'pickup' ? 'Pickup' : 'Drop-off'}`}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Recent Boardings Sidebar */}
        <aside className="recent-boardings">
          <h3>Recent Check-ins</h3>
          {recentBoardings.length === 0 ? (
            <p className="no-data">No check-ins yet today</p>
          ) : (
            <ul className="boarding-list">
              {recentBoardings.map((boarding) => (
                <li key={boarding.id} className="boarding-item">
                  <strong>{boarding.student?.full_name}</strong>
                  <span className={`boarding-type ${boarding.boarding_type}`}>
                    {boarding.boarding_type}
                  </span>
                  <small>{new Date(boarding.boarding_time).toLocaleTimeString()}</small>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

export default CheckIn;
