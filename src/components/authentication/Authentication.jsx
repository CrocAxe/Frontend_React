import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../../redux/AuthActions';
import { clearError } from '../../redux/AuthSlice';
import Dashboard from '../Dashboard/Dashboard';
import './Authentication.css';

const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  const toggleForm = () => {
    setIsRegistered(!isRegistered);
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistered) {
      // Registration logic
      if (password !== confirmPassword) {
        dispatch(setError('Passwords do not match'));
        return;
      }

      try {
        await dispatch(registerUser({ email, password }));
        alert('Registration successful! Please sign in.');
        toggleForm();
      } catch (err) {
        console.log('Registration error: ', err)
      }
    } else {
      // Sign-in logic
      try {
        await dispatch(loginUser({ email, password }));
      } catch (err) {
        console.log('Registration error: ', err)
      }
    }
  };

  // Redirect to Dashboard if authenticated
  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="auth-container">
      <div className={`auth-box ${isRegistered ? 'register' : 'signin'}`}>
        <div className="auth-form">
          <h1>{isRegistered ? 'Sign Up' : 'Sign In'}</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
            />
            {isRegistered && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-label="Confirm Password"
              />
            )}
            {error && <p className="error" aria-live="assertive">{error}</p>}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Processing...' : isRegistered ? 'Sign Up' : 'Sign In'}
            </button>
            <p>
              {isRegistered ? 'Already have an account? ' : 'New User? '}
              <span onClick={toggleForm} className="toggle-link" role="button" tabIndex={0}>
                {isRegistered ? 'Sign In here!' : 'Sign Up here!'}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Authentication;