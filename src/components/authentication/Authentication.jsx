import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import Dashboard from '../Dashboard/Dashboard'
import './Authentication.css';

const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if user is authenticated

  const auth = getAuth();

  const toggleForm = () => {
    setIsRegistered(!isRegistered);
    setError(null); // Clear error when toggling forms
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isRegistered) {
      if (password === confirmPassword) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          alert('Registration successful! Please sign in.');
          toggleForm();
        } catch (err) {
          setError(err.message);
        }
      } else {
        setError('Passwords do not match');
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setIsAuthenticated(true); // Set authenticated state to true
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (isAuthenticated) {
    return <Dashboard />; // Render Dashboard if authenticated
  }

  return (
    <div className="auth-container">
      <div className={`auth-box ${isRegistered ? 'register' : 'signin'}`}>
        <div className="auth-form">
          <h1>{isRegistered ? 'Sign Up' : 'Sign In'}</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {isRegistered && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}
            {error && <p className="error">{error}</p>}
            <button type="submit" className="submit-btn">
              {isRegistered ? 'Sign Up' : 'Sign In'}
            </button>
            <p>
              {isRegistered ? 'Already have an account? ' : 'New User? '}
              <span onClick={toggleForm} className="toggle-link">
                {isRegistered ? 'Sign In here!' : 'Sign Up here!'}
              </span>
            </p>
          </form>
        </div>
        <div className="auth-info">
          {/* Additional content or imagery */}
        </div>
      </div>
    </div>
  );
};

export default Authentication;
