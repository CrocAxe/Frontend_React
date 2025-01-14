import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signInWithGoogle } from "../../redux/AuthActions";
import { login, register, setIsRegistered } from "../../redux/AuthSlice"
import './Authentication.css';
import image from '../../assets/25_website_featured__0BsXQ.jpg';

const Authentication = () => {
    const dispatch = useDispatch();
    const { user, loading, error, isRegistered } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        phone: "",
    });

    const [isSignedIn, setIsSignedIn] = useState(false);

    // Update signed-in state when user changes
    useEffect(() => {
        if (user) {
            setIsSignedIn(true);
        } else {
            setIsSignedIn(false);
        }
    }, [user]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle email/password authentication (login or register)
    const handleEmailAuth = async (event) => {
        event.preventDefault();
        const { email, password, name, phone } = formData;

        try {
            if (isRegistered) {
                // Login
                await dispatch(login({ email, password })).unwrap();
            } else {
                // Register
                await dispatch(register({ email, password, name, phone })).unwrap();
                dispatch(setIsRegistered(true)); // Set registration status to true
                setFormData({ email: "", password: "", name: "", phone: "" }); // Clear form
            }
        } catch (error) {
            console.error("Authentication Error:", error);
        }
    };

    // Handle Google authentication
    const handleGoogleAuth = async () => {
        try {
            await dispatch(signInWithGoogle()).unwrap();
        } catch (error) {
            console.error("Google Sign-In Error:", error);
        }
    };

    // Toggle between login and registration forms
    const toggleForm = () => {
        dispatch(setIsRegistered(!isRegistered));
        setFormData({ email: "", password: "", name: "", phone: "" }); // Clear form
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="img">
                    <img src={image} alt="authentication" className="auth-img" />
                </div>
                <div className="myForm">
                    <h2>{isRegistered ? "Welcome Back!" : "Pleased To Meet You!"}</h2>

                    {/* Display error message if any */}
                    {error && <div className="error-alert">{error}</div>}

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="auth-form">
                        {/* Show name and phone fields for registration */}
                        {!isRegistered && (
                            <>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Name"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone Number"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}

                        {/* Email field */}
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email address"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password field */}
                        <div className="form-group">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Submit button */}
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? "Processing..." : isRegistered ? "Sign In" : "Sign Up"}
                        </button>
                    </form>

                    {/* Google Sign-In Button */}
                    <button onClick={handleGoogleAuth} className="google-button" disabled={loading}>
                        Continue with Google
                    </button>

                    {/* Toggle between login and registration */}
                    <button onClick={toggleForm} className="toggle-button" disabled={loading}>
                        {isRegistered ? "Need an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Authentication;