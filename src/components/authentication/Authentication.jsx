import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import Dashboard from '../Dashboard/Dashboard';
import './Authentication.css';

const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const auth = getAuth();

  const toggleForm = () => {
    setIsRegistered(!isRegistered);
    setError(null); // Clear error when toggling forms
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // Set loading state

    if (isRegistered) {
      // Registration logic
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Registration successful! Please sign in.');
        toggleForm(); // Switch to sign-in form
      } catch (err) {
        setError(getErrorMessage(err.code)); // Use a helper function for error messages
      }
    } else {
      // Sign-in logic
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setIsAuthenticated(true); // Set authenticated state to true
      } catch (err) {
        setError(getErrorMessage(err.code)); // Use a helper function for error messages
      }
    }

    setIsLoading(false); // Reset loading state
  };

  // Helper function to map Firebase error codes to user-friendly messages
  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      default:
        return 'An error occurred. Please try again.';
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
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : isRegistered ? 'Sign Up' : 'Sign In'}
            </button>
            <p>
              {isRegistered ? 'Already have an account? ' : 'New User? '}
              <span onClick={toggleForm} className="toggle-link" role="button" tabIndex={0}>
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