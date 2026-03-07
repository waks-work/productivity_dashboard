import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { useEffect } from 'react';

export const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("access")) {
      navigate("dashboard");
    }
  }, [navigate]);

  return (
    <div className="landing-wrapper">
      <nav className="navbar">
        <div className="brand">TaskMaster</div>
        <div className="nav-links">
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/register" className="btn-primary">Join Now</Link>
        </div>
      </nav>

      <header className="hero-section">
        <h1>Master Your Workflow, <br /><span>Boost Productivity.</span></h1>
        <p>The all-in-one task management platform designed for modern teams and individual excellence.</p>
        <Link to="/register" className="btn-cta">Start for Free</Link>
      </header>

      <section className="features">
        <div className="feature">✨ Real-time Analytics</div>
        <div className="feature">📅 Smart Scheduling</div>
        <div className="feature">🔒 Enterprise Security</div>
      </section>
    </div>
  );
};

