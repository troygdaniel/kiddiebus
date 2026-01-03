import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentsAPI, routesAPI, usersAPI, schoolsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

function StudentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { isOperator, isParent } = useAuthStore();

  const [routes, setRoutes] = useState([]);
  const [parents, setParents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    grade: '',
    school_id: '',
    school_name: '',
    parent_id: '',
    route_id: '',
    pickup_address: '',
    dropoff_address: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFormData();
    if (isEdit) {
      loadStudent();
    }
  }, [id]);

  const loadFormData = async () => {
    try {
      const [routesRes, schoolsRes] = await Promise.all([
        routesAPI.getAll({ status: 'active' }),
        schoolsAPI.getAllForDropdown(),
      ]);
      setRoutes(routesRes.data.routes);
      setSchools(schoolsRes.data.schools);

      if (isOperator()) {
        const parentsRes = await usersAPI.getAll('parent');
        setParents(parentsRes.data.users);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const loadStudent = async () => {
    try {
      const response = await studentsAPI.getById(id);
      const student = response.data.student;
      setFormData({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        date_of_birth: student.date_of_birth || '',
        grade: student.grade || '',
        school_id: student.school_id || '',
        school_name: student.school_name || '',
        parent_id: student.parent_id || '',
        route_id: student.route_id || '',
        pickup_address: student.pickup_address || '',
        dropoff_address: student.dropoff_address || '',
      });
    } catch (error) {
      console.error('Error loading student:', error);
      setError('Failed to load student');
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
      const data = {
        ...formData,
        school_id: formData.school_id || null,
        route_id: formData.route_id || null,
        parent_id: formData.parent_id || null,
      };

      if (isEdit) {
        await studentsAPI.update(id, data);
      } else {
        await studentsAPI.create(data);
      }
      navigate(isParent() ? '/my-children' : '/students');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save student');
    } finally {
      setIsLoading(false);
    }
  };

  const backPath = isParent() ? '/my-children' : '/students';

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{isEdit ? 'Edit' : 'Add'} {isParent() ? 'Child' : 'Student'}</h1>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">First Name *</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              placeholder="First name"
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
              required
              placeholder="Last name"
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
          <label htmlFor="school_id">School</label>
          <select
            id="school_id"
            name="school_id"
            value={formData.school_id}
            onChange={handleChange}
          >
            <option value="">Select school</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
        </div>

        {isOperator() && (
          <div className="form-group">
            <label htmlFor="parent_id">Parent *</label>
            <select
              id="parent_id"
              name="parent_id"
              value={formData.parent_id}
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
        )}

        <div className="form-group">
          <label htmlFor="route_id">Assigned Route</label>
          <select
            id="route_id"
            name="route_id"
            value={formData.route_id}
            onChange={handleChange}
          >
            <option value="">Select route (optional)</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>{route.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="pickup_address">Pickup Address</label>
          <input
            type="text"
            id="pickup_address"
            name="pickup_address"
            value={formData.pickup_address}
            onChange={handleChange}
            placeholder="Address for morning pickup"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dropoff_address">Drop-off Address</label>
          <input
            type="text"
            id="dropoff_address"
            name="dropoff_address"
            value={formData.dropoff_address}
            onChange={handleChange}
            placeholder="Address for afternoon drop-off"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(backPath)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Add'} {isParent() ? 'Child' : 'Student'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentForm;
