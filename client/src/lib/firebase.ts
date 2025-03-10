
// Add this function at the top of your file
export const debugGoogleAuthConfig = () => {
  const provider = new GoogleAuthProvider();
  // Log the current redirect URL that Firebase is using
  console.log("Current redirect URL:", window.location.origin);
  console.log("Provider settings:", provider);
  return {
    redirectUrl: window.location.origin,
    provider
  };
};

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export { signInWithEmailAndPassword, createUserWithEmailAndPassword };

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

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw new Error(`Failed to sign out: ${error.message}`);
  }
};

// Google authentication
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  // Add scopes if needed
  provider.addScope('profile');
  provider.addScope('email');
  
  // Set custom parameters
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  console.log("Auth attempt with redirect URL:", window.location.origin);
  
  try {
    // Try with popup first
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error("Google login error details:", {
      code: error.code,
      message: error.message,
      email: error.email,
      credential: error.credential,
      customData: error.customData
    });
    
    // If error is related to redirect URI, provide more helpful information
    if (error.code === 'auth/unauthorized-domain' || error.message.includes('redirect_uri_mismatch')) {
      console.error("Your domain is not authorized in the Firebase console or Google Cloud Console");
      console.error("Current domain:", window.location.origin);
      throw new Error(`Authentication failed: Your application domain (${window.location.origin}) is not authorized for Google authentication. Please add this domain to the authorized domains in the Firebase console and Google Cloud Console.`);
    }
    
    throw new Error(`Failed to sign in with Google: ${error.message}`);
  }
};