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

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Pop-up was blocked. Please allow pop-ups for this site.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error("Sign-in was cancelled.");
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error("This domain is not authorized for sign-in. Please contact the administrator.");
    } else {
      throw new Error("Failed to sign in with Google. Please try again.");
    }
  }
};