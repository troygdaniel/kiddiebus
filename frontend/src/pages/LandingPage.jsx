import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <nav className="landing-nav">
          <div className="landing-logo">Kiddie Bus</div>
          <div className="landing-nav-links">
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </nav>
        <div className="hero-content">
          <h1>Safe School Transportation, Simplified</h1>
          <p>Real-time bus tracking, instant notifications, and seamless check-ins for schools in Jamaica</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">Start Free Trial</Link>
            <Link to="/login" className="btn btn-secondary btn-large">Sign In</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Register Your Service</h3>
            <p>Bus operators create an account and add their fleet and routes</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Parents Connect</h3>
            <p>Parents register and link their children to their assigned bus routes</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Track & Communicate</h3>
            <p>Real-time updates keep everyone informed and children safe</p>
          </div>
        </div>
      </section>

      {/* Benefits by Persona */}
      <section className="benefits">
        <h2>Built for Everyone</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🚌</div>
            <h3>For Bus Operators</h3>
            <ul>
              <li>Manage routes and schedules from any device</li>
              <li>Send instant notifications to all parents</li>
              <li>Digital check-in replaces paper logs</li>
              <li>Real-time location sharing with parents</li>
              <li>Compliance-ready reporting</li>
            </ul>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">👨‍👩‍👧</div>
            <h3>For Parents</h3>
            <ul>
              <li>Track your child's bus in real-time</li>
              <li>Get notified when bus is approaching</li>
              <li>Receive delay and schedule alerts instantly</li>
              <li>View boarding history and confirmations</li>
              <li>Peace of mind, every school day</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features">
        <h2>Powerful Features</h2>
        <div className="features-grid">
          <div className="feature">
            <h4>Real-Time Tracking</h4>
            <p>GPS-powered bus locations on an interactive map</p>
          </div>
          <div className="feature">
            <h4>SMS & Email Alerts</h4>
            <p>Instant notifications via Twilio and SendGrid</p>
          </div>
          <div className="feature">
            <h4>Student Check-In</h4>
            <p>NFC card/fob or manual verification system</p>
          </div>
          <div className="feature">
            <h4>Route Management</h4>
            <p>Create, edit, and optimize bus routes easily</p>
          </div>
          <div className="feature">
            <h4>Multi-Role Access</h4>
            <p>Separate dashboards for operators and parents</p>
          </div>
          <div className="feature">
            <h4>Mobile Friendly</h4>
            <p>Works on any device, anywhere in Jamaica</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join schools across Jamaica using Kiddie Bus for safer transportation</p>
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary btn-large">Create Free Account</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2025 Kiddie Bus. School Transportation Made Simple.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
