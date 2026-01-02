import { Link } from 'react-router-dom';

function RegisterChoice() {
  return (
    <div className="auth-container">
      <div className="register-choice">
        <h1>Join Kiddie Bus</h1>
        <p className="auth-subtitle">Select how you'll be using Kiddie Bus</p>

        <div className="role-cards">
          <Link to="/register/parent" className="role-card">
            <div className="role-icon">👨‍👩‍👧</div>
            <h2>I'm a Parent</h2>
            <p>Track your child's school bus in real-time and receive instant notifications about pickups, drop-offs, and delays.</p>
            <ul className="role-benefits">
              <li>Real-time bus tracking</li>
              <li>Instant delay notifications</li>
              <li>Boarding confirmations</li>
            </ul>
            <span className="btn btn-primary">Register as Parent</span>
          </Link>

          <Link to="/register/operator" className="role-card">
            <div className="role-icon">🚌</div>
            <h2>I'm a Fleet Operator</h2>
            <p>Manage your bus fleet, routes, and communicate with parents efficiently. Perfect for schools and transport companies.</p>
            <ul className="role-benefits">
              <li>Route management</li>
              <li>Student check-in system</li>
              <li>Parent notifications</li>
            </ul>
            <span className="btn btn-primary">Register as Operator</span>
          </Link>
        </div>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterChoice;
