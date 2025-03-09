import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKWMTRKLwE2YqChq9j2Py7jN--wJn73cY",
  authDomain: "mileage-tracker-demo.firebaseapp.com",
  projectId: "mileage-tracker-demo",
  storageBucket: "mileage-tracker-demo.appspot.com",
  messagingSenderId: "991101916732",
  appId: "1:991101916732:web:3a49f7e8ca6c9d1add2c59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const firestore = getFirestore(app);


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
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error("Google login error:", error);
    throw new Error(`Failed to sign in with Google: ${error.message}`);
  }
};

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };