import { useEffect, useState } from 'react';
import { schoolsAPI } from '../services/api';

function Schools() {
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Mandeville',
    parish: 'Manchester',
    phone: '',
    email: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setIsLoading(true);
    try {
      const response = await schoolsAPI.getAll();
      setSchools(response.data.schools);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: 'Mandeville',
      parish: 'Manchester',
      phone: '',
      email: '',
    });
    setEditingSchool(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      address: school.address || '',
      city: school.city || 'Mandeville',
      parish: school.parish || 'Manchester',
      phone: school.phone || '',
      email: school.email || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingSchool) {
        await schoolsAPI.update(editingSchool.id, formData);
      } else {
        await schoolsAPI.create(formData);
      }
      resetForm();
      loadSchools();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save school');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this school?')) {
      try {
        await schoolsAPI.delete(id);
        loadSchools();
      } catch (error) {
        console.error('Error deleting school:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading schools...</div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Schools</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Add New School
        </button>
      </header>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingSchool ? 'Edit School' : 'Add New School'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">School Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Belair School"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main Street"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Mandeville"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="parish">Parish</label>
                  <input
                    type="text"
                    id="parish"
                    name="parish"
                    value={formData.parish}
                    onChange={handleChange}
                    placeholder="e.g., Manchester"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g., 876-555-1234"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g., info@school.edu.jm"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSchool ? 'Update School' : 'Add School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {schools.length === 0 ? (
        <div className="empty-state">
          <h3>No schools registered</h3>
          <p>Add your first school to get started.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add School
          </button>
        </div>
      ) : (
        <div className="school-cards">
          {schools.map((school) => (
            <div key={school.id} className="school-card">
              <div className="school-card-header">
                <h3>{school.name}</h3>
                <span className="student-count">{school.student_count} students</span>
              </div>
              <div className="school-card-body">
                {school.address && (
                  <p className="school-address">{school.address}</p>
                )}
                <p className="school-location">{school.city}, {school.parish}</p>
                {school.phone && (
                  <p className="school-contact">
                    <span className="contact-icon">Tel:</span> {school.phone}
                  </p>
                )}
                {school.email && (
                  <p className="school-contact">
                    <span className="contact-icon">Email:</span> {school.email}
                  </p>
                )}
              </div>
              <div className="school-card-actions">
                <button onClick={() => handleEdit(school)} className="btn btn-small">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(school.id)}
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

export default Schools;
