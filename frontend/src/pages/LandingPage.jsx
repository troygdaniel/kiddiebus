import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

// Custom hook for intersection observer (scroll-triggered animations)
function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });

    const current = ref.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [options]);

  return [ref, isVisible];
}

// Animated counter component
function AnimatedCounter({ value, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useIntersectionObserver();
  const isNumber = !isNaN(parseInt(value));

  useEffect(() => {
    if (!isVisible || !isNumber) return;

    const target = parseInt(value);
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration, isNumber]);

  return (
    <span ref={ref}>
      {isNumber ? count : value}{suffix}
    </span>
  );
}

// Animated section component
function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax effect for hero
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        <div
          className="hero-content"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
          }}
        >
          <div className="hero-badge">School Transportation Platform</div>
          <h1>One Platform for <span className="highlight">Optimal Fleet Performance</span></h1>
          <p>Connect your entire fleet seamlessly. Real-time tracking, instant notifications, and intelligent insights for school bus operators across Jamaica.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">Start Free Trial</Link>
            <Link to="/login" className="btn btn-secondary btn-large">Sign In</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">
                <AnimatedCounter value="100" suffix="%" />
              </div>
              <div className="hero-stat-label">Real-Time Visibility</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">24/7</div>
              <div className="hero-stat-label">Parent Communication</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">Instant</div>
              <div className="hero-stat-label">Check-In Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <AnimatedSection>
          <div className="section-badge">How It Works</div>
          <h2>Get Started in Minutes</h2>
          <p className="section-subtitle">Simple setup, powerful results. Transform your school bus operations with three easy steps.</p>
        </AnimatedSection>
        <div className="steps-grid">
          <AnimatedSection delay={0.1}>
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register Your Fleet</h3>
              <p>Bus operators create an account, add their vehicles, and configure routes in minutes</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Connect Parents</h3>
              <p>Parents register and link their children to assigned bus routes for real-time updates</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Track & Communicate</h3>
              <p>Real-time GPS tracking and instant notifications keep everyone informed and children safe</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits by Persona */}
      <section className="benefits">
        <AnimatedSection>
          <div className="section-badge">Built for Everyone</div>
          <h2>Unlock Fleet Potential</h2>
          <p className="section-subtitle">Drive safety, efficiency, and peace of mind with AI-powered insights for your school transportation.</p>
        </AnimatedSection>
        <div className="benefits-grid">
          <AnimatedSection delay={0.1}>
            <div className="benefit-card">
              <div className="benefit-icon">🚌</div>
              <h3>For Bus Operators</h3>
              <ul>
                <li>Manage routes and schedules from any device</li>
                <li>Send instant notifications to all parents</li>
                <li>Digital check-in replaces paper logs</li>
                <li>Real-time location sharing with parents</li>
                <li>Compliance-ready reporting for authorities</li>
              </ul>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
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
          </AnimatedSection>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features">
        <AnimatedSection>
          <div className="section-badge">Powerful Features</div>
          <h2>Everything You Need</h2>
          <p className="section-subtitle">A complete platform designed specifically for school transportation in Jamaica.</p>
        </AnimatedSection>
        <div className="features-grid">
          <AnimatedSection delay={0.05}>
            <div className="feature">
              <div className="feature-icon">📍</div>
              <h4>Real-Time GPS Tracking</h4>
              <p>Live bus locations on an interactive map with automatic updates every few seconds</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="feature">
              <div className="feature-icon">📱</div>
              <h4>SMS & Email Alerts</h4>
              <p>Instant notifications via Twilio SMS and SendGrid email keep everyone informed</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <div className="feature">
              <div className="feature-icon">✅</div>
              <h4>Student Check-In</h4>
              <p>NFC card/fob or manual verification system with instant parent confirmation</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="feature">
              <div className="feature-icon">🗺️</div>
              <h4>Route Management</h4>
              <p>Create, edit, and optimize bus routes with intelligent scheduling tools</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.25}>
            <div className="feature">
              <div className="feature-icon">👥</div>
              <h4>Multi-Role Access</h4>
              <p>Separate dashboards for operators, drivers, and parents with role-based permissions</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="feature">
              <div className="feature-icon">📊</div>
              <h4>Analytics & Reports</h4>
              <p>Comprehensive insights on ridership, punctuality, and fleet performance</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <AnimatedSection>
          <h2>Ready to Transform Your Fleet?</h2>
          <p>Join school transportation operators across Jamaica using Kiddie Bus for safer, smarter operations</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">Create Free Account</Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2025 Kiddie Bus. School Transportation Made Simple.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
