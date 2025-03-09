
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

if (!import.meta.env.VITE_FIREBASE_API_KEY || 
    !import.meta.env.VITE_FIREBASE_PROJECT_ID || 
    !import.meta.env.VITE_FIREBASE_APP_ID) {
  throw new Error("Missing Firebase configuration");
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY.trim(),
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID.trim()}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID.trim(),
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID.trim()}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID.trim(),
};

// Initialize Firebase with verbose logging
console.log("Initializing Firebase with config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    console.log("Attempting Google sign in...");
    const result = await signInWithPopup(auth, provider);
    console.log("Sign in successful:", result.user.uid);
    return result.user;
  } catch (error: any) {
    console.error("Detailed sign-in error:", {
      code: error.code,
      message: error.message,
      customData: error.customData
    });
    
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Pop-up was blocked. Please allow pop-ups for this site.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error("Sign-in was cancelled.");
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error("This domain is not authorized for sign-in. Please contact the administrator.");
    } else {
      throw new Error(`Failed to sign in with Google: ${error.message}`);
    }
  }
};

// Email/Password authentication functions
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Email signup error:", error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("Email already in use. Try logging in instead.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Password is too weak. Please use a stronger password.");
    } else {
      throw new Error(`Failed to sign up: ${error.message}`);
    }
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Email login error:", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error("Invalid email or password.");
    } else {
      throw new Error(`Failed to log in: ${error.message}`);
    }
  }
};
