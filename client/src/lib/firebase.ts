import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

if (!import.meta.env.VITE_FIREBASE_API_KEY || 
    !import.meta.env.VITE_FIREBASE_PROJECT_ID || 
    !import.meta.env.VITE_FIREBASE_APP_ID) {
  throw new Error("Missing Firebase configuration");
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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