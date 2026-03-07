import { Link } from 'react-router-dom';
import './NotFound.css';

export const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-message">Oops! You've drifted off track.</h2>
        <p className="notfound-desc">
          The page you are looking for doesn't exist or has been moved.
          Let's get you back to being productive.
        </p>
        <Link to="/" className="notfound-btn">
          Back to Safety
        </Link>
      </div>
    </div>
  );
};

