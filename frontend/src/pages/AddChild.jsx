import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI } from '../services/api';

function AddChild() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdChild, setCreatedChild] = useState(null);

  console.log('[AddChild] Component rendered!');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    grade: '',
    school_name: '',
    pickup_address: '',
    dropoff_address: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (!formData.first_name || !formData.last_name) {
      setError('Please enter your child\'s first and last name');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await studentsAPI.create(formData);
      setCreatedChild(response.data.student);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add child. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Success
  if (step === 3 && createdChild) {
    return (
      <div className="add-child-container">
        <div className="add-child-card success-card">
          <div className="success-icon">✓</div>
          <h1>{createdChild.first_name} has been added!</h1>
          <p className="success-message">
            Your child is now registered with Kiddie Bus.
          </p>

          <div className="card-id-display-large">
            <span className="label">Child's Bus Card ID</span>
            <span className="card-id-value">{createdChild.card_id}</span>
            <small>Save this ID - it's used for bus check-in</small>
          </div>

          <div className="next-steps">
            <h3>What happens next?</h3>
            <ol>
              <li>Your bus operator will assign {createdChild.first_name} to a route</li>
              <li>You'll receive a notification when the route is assigned</li>
              <li>Start tracking {createdChild.first_name}'s bus in real-time!</li>
            </ol>
          </div>

          <div className="success-actions">
            <button onClick={() => navigate('/dashboard/my-children')} className="btn btn-primary btn-large">
              View My Children
            </button>
            <button
              onClick={() => {
                setStep(1);
                setFormData({
                  first_name: '',
                  last_name: '',
                  date_of_birth: '',
                  grade: '',
                  school_name: '',
                  pickup_address: '',
                  dropoff_address: '',
                });
                setCreatedChild(null);
              }}
              className="btn btn-secondary"
            >
              Add Another Child
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-child-container">
      <div className="add-child-card">
        <div className="add-child-header">
          <h1>Add Your Child</h1>
          <p>Register your child to start tracking their school bus</p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-steps">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Basic Info</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Addresses</span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <h2>Tell us about your child</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name *</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name *</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date_of_birth">Date of Birth</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                  <small>Optional - helps verify identity</small>
                </div>
                <div className="form-group">
                  <label htmlFor="grade">Grade/Class</label>
                  <input
                    type="text"
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="e.g., Grade 3"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="school_name">School Name</label>
                <input
                  type="text"
                  id="school_name"
                  name="school_name"
                  value={formData.school_name}
                  onChange={handleChange}
                  placeholder="Which school does your child attend?"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => navigate('/dashboard/my-children')} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="button" onClick={handleNext} className="btn btn-primary">
                  Next: Add Addresses
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>Pickup & Drop-off Locations</h2>
              <p className="form-note">These addresses help the bus operator plan routes efficiently.</p>

              <div className="form-group">
                <label htmlFor="pickup_address">Morning Pickup Address</label>
                <input
                  type="text"
                  id="pickup_address"
                  name="pickup_address"
                  value={formData.pickup_address}
                  onChange={handleChange}
                  placeholder="Where should the bus pick up your child?"
                />
                <small>Usually your home address</small>
              </div>

              <div className="form-group">
                <label htmlFor="dropoff_address">Afternoon Drop-off Address</label>
                <input
                  type="text"
                  id="dropoff_address"
                  name="dropoff_address"
                  value={formData.dropoff_address}
                  onChange={handleChange}
                  placeholder="Where should the bus drop off your child?"
                />
                <small>Leave blank if same as pickup address</small>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleBack} className="btn btn-secondary">
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Adding Child...' : 'Add Child'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AddChild;
