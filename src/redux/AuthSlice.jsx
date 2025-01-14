import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';

// Initial state
const initialState = {
  user: null, // Firebase user object
  loading: false, // Loading state
  error: null, // Error message
  isRegistered: false, // Track registration status
  token: null, // JWT token from backend
};

// Helper function to handle Firebase errors
const handleFirebaseError = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account exists with this email';
    case 'auth/wrong-password':
      return 'Invalid password';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    default:
      return 'Authentication failed';
  }
};

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Step 1: Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Step 2: Send token to backend for session creation
      const response = await axios.post(
        'http://localhost:5000/users/login',
        { email },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Step 3: Store the token in localStorage for persistence
      localStorage.setItem('authToken', idToken);

      return { user: userCredential.user, token: idToken, backendData: response.data };
    } catch (error) {
      return rejectWithValue(
        handleFirebaseError(error) ||
          error.response?.data?.message ||
          error.message ||
          'Login failed'
      );
    }
  }
);

// Async thunk for registration
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, name, phone }, { rejectWithValue }) => {
    try {
      // Step 1: Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Step 2: Register user in backend with additional info
      const response = await axios.post(
        'http://localhost:5000/users/register',
        { email, name, phone },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Step 3: Store the token in localStorage for persistence
      localStorage.setItem('authToken', idToken);

      return { user: userCredential.user, token: idToken, backendData: response.data };
    } catch (error) {
      return rejectWithValue(
        handleFirebaseError(error) ||
          error.response?.data?.message ||
          error.message ||
          'Registration failed'
      );
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Step 1: Sign out from Firebase
      await signOut(auth);

      // Step 2: Notify backend about logout
      await axios.post('http://localhost:5000/users/logout');

      // Step 3: Remove token from localStorage
      localStorage.removeItem('authToken');

      return null; // Return null to clear the user state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Logout failed'
      );
    }
  }
);

// Async thunk to check authentication status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Step 1: Get token from localStorage
      const idToken = localStorage.getItem('authToken');
      if (!idToken) throw new Error('No token found');

      // Step 2: Verify token with backend
      const response = await axios.get('http://localhost:5000/users/me', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      return { user: response.data.user, token: idToken };
    } catch (error) {
      localStorage.removeItem('authToken');
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Authentication check failed'
      );
    }
  }
);

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetAuth: () => initialState,
    setIsRegistered: (state) => {
      state.isRegistered = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = action.payload;
      })

      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
        state.isRegistered = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = action.payload;
        state.isRegistered = false;
      })

      // Logout cases
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        return initialState;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { resetError, resetAuth, setIsRegistered } = authSlice.actions;

// Export reducer
export default authSlice.reducer;