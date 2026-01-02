import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentsAPI, routesAPI } from '../services/api';
import useAuthStore from '../store/authStore';

function Students() {
  const { isOperator } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRoute, setFilterRoute] = useState('');

  useEffect(() => {
    loadData();
  }, [filterRoute]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, routesRes] = await Promise.all([
        studentsAPI.getAll(filterRoute || undefined),
        isOperator() ? routesAPI.getAll({ status: 'active' }) : Promise.resolve({ data: { routes: [] } }),
      ]);
      setStudents(studentsRes.data.students);
      setRoutes(routesRes.data.routes);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      try {
        await studentsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{isOperator() ? 'Students' : 'My Children'}</h1>
        <Link to={isOperator() ? '/dashboard/students/new' : '/dashboard/my-children/add'} className="btn btn-primary">
          Add {isOperator() ? 'Student' : 'Child'}
        </Link>
      </header>

      {isOperator() && routes.length > 0 && (
        <div className="filters">
          <select value={filterRoute} onChange={(e) => setFilterRoute(e.target.value)}>
            <option value="">All Routes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>{route.name}</option>
            ))}
          </select>
        </div>
      )}

      {students.length === 0 ? (
        <div className="empty-state">
          {isOperator() ? (
            <>
              <h3>No students found</h3>
              <p>Students will appear here when parents register them.</p>
            </>
          ) : (
            <>
              <div className="empty-icon">👨‍👩‍👧‍👦</div>
              <h3>Welcome to Kiddie Bus!</h3>
              <p>Add your children to start tracking their school bus and receive real-time updates.</p>
              <div className="benefits-list">
                <span>✓ Real-time bus tracking</span>
                <span>✓ Instant delay notifications</span>
                <span>✓ Boarding confirmations</span>
              </div>
              <Link to="/dashboard/my-children/add" className="btn btn-primary btn-large">Add Your First Child</Link>
            </>
          )}
        </div>
      ) : (
        <div className="card-grid">
          {students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-header">
                <h3>{student.full_name}</h3>
                <span className="card-id">ID: {student.card_id}</span>
              </div>
              <div className="student-details">
                <p><strong>Grade:</strong> {student.grade || 'Not set'}</p>
                <p><strong>School:</strong> {student.school_name || 'Not set'}</p>
                <p><strong>Pickup:</strong> {student.pickup_address || 'Not set'}</p>
              </div>
              <div className="card-actions">
                <Link to={`/students/${student.id}`} className="btn btn-small">View</Link>
                <Link to={`/students/${student.id}/edit`} className="btn btn-small">Edit</Link>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="btn btn-small btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Students;
