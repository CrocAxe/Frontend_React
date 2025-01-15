import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile
} from "firebase/auth";
import { 
    getFirestore, 
    setDoc, 
    doc, 
    getDoc, 
    serverTimestamp 
} from "firebase/firestore";
import { auth, firestore } from "../firebase";
// import { setLoading, setUser } from "./AuthSlice";

// Enhanced email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return "Please enter a valid email address";
    }
    return null;
};

// Enhanced password validation
const validatePassword = (password) => {
    if (!password) {
        return "Password is required";
    }
    if (password.length < 6) {
        return "Password must be at least 6 characters long";
    }
    if (!/\d/.test(password)) {
        return "Password must contain at least one number";
    }
    if (!/[a-zA-Z]/.test(password)) {
        return "Password must contain at least one letter";
    }
    return null;
};

// Create or update user document in Firestore
const updateUserData = async (user, additionalData = {}) => {
    const userRef = doc(firestore, "users", user.uid);
    const userData = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName || additionalData.displayName,
        photoURL: user.photoURL,
        lastLoginAt: serverTimestamp(),
        ...additionalData
    };

    try {
        await setDoc(userRef, userData, { merge: true });
        return userData;
    } catch (error) {
        console.error("Error updating user data:", error);
        throw error;
    }
};

export const signUpUser = (email, password, additionalData = {}) => async (dispatch) => {
    try {
        dispatch(setLoading(true));

        // Validate inputs
        const emailError = validateEmail(email);
        if (emailError) {
            dispatch(setError(emailError));
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            dispatch(setError(passwordError));
            return;
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile if name is provided
        if (additionalData.displayName) {
            await updateProfile(userCredential.user, {
                displayName: additionalData.displayName
            });
        }

        // Save user data to Firestore
        const userData = await updateUserData(userCredential.user, {
            ...additionalData,
            createdAt: serverTimestamp(),
        });

        dispatch(setUser(userData));
        return userData;

    } catch (error) {
        console.error("Sign Up Error:", error);
        const errorMessage = handleAuthError(error);
        dispatch(setError(errorMessage));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
};

export const signInUser = (email, password) => async (dispatch) => {
    try {
        dispatch(setLoading(true));

        // Validate email
        const emailError = validateEmail(email);
        if (emailError) {
            dispatch(setError(emailError));
            return;
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Update user data in Firestore and get latest user data
        const userData = await updateUserData(userCredential.user);
        
        dispatch(setUser(userData));
        return userData;

    } catch (error) {
        console.error("Sign In Error:", error);
        const errorMessage = handleAuthError(error);
        dispatch(setError(errorMessage));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
};

export const signInWithGoogle = () => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        const userCredential = await signInWithPopup(auth, provider);
        
        // Update user data in Firestore and get latest user data
        const userData = await updateUserData(userCredential.user, {
            signInMethod: 'google'
        });

        dispatch(setUser(userData));
        return userData;

    } catch (error) {
        console.error("Google Sign In Error:", error);
        dispatch(setError("Failed to sign in with Google. Please try again."));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
};

export const signOutUser = () => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        await signOut(auth);
        dispatch(setUser(null));
    } catch (error) {
        console.error("Sign Out Error:", error);
        dispatch(setError("Failed to sign out. Please try again."));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
};

// Centralized error handling
const handleAuthError = (error) => {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return "This email is already registered. Please sign in instead.";
        case 'auth/wrong-password':
            return "Incorrect password. Please try again.";
        case 'auth/user-not-found':
            return "No account found with this email. Please register.";
        case 'auth/invalid-email':
            return "Please enter a valid email address.";
        case 'auth/weak-password':
            return "Password should be at least 6 characters long.";
        case 'auth/network-request-failed':
            return "Network error. Please check your connection.";
        case 'auth/too-many-requests':
            return "Too many failed attempts. Please try again later.";
        case 'auth/user-disabled':
            return "This account has been disabled. Please contact support.";
        default:
            return error.message || "An unexpected error occurred. Please try again.";
    }
};