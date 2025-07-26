// js/firebase/auth.js - Authentication Service
import { auth, db } from './config.js';
import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Current user state
let currentUser = null;

// Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google
export async function signInWithGoogle() {
  try {
    console.log('🔄 Starting Google sign-in...');
    console.log('📱 Auth instance:', auth);
    console.log('🔑 Provider:', googleProvider);
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google sign-in successful:', result.user.email);
    await saveUserToFirestore(result.user);
    return result.user;
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Check for specific errors
    if (error.code === 'auth/unauthorized-domain') {
      console.error('🚨 Domain not authorized in Firebase Console!');
      console.error('Add "localhost" to authorized domains in Firebase Console > Authentication > Settings');
    }
    
    throw error;
  }
}

// Sign in with email
export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Email sign-in successful:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('❌ Email sign-in error:', error);
    throw error;
  }
}

// Create account
export async function createAccount(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Account created:', result.user.email);
    await saveUserToFirestore(result.user);
    return result.user;
  } catch (error) {
    console.error('❌ Create account error:', error);
    throw error;
  }
}

// Sign out
export async function signOutUser() {
  try {
    await signOut(auth);
    console.log('✅ Signed out successfully');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
}

// Save user to Firestore
async function saveUserToFirestore(user) {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    }, { merge: true });
    console.log('📝 User saved to Firestore');
  } catch (error) {
    console.error('❌ Firestore error:', error);
  }
}

// Auth state observer
export function observeAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
}

// Get current user
export function getCurrentUser() {
  return currentUser;
}

// Get user-friendly error message
export function getErrorMessage(error) {
  switch (error.code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    default:
      return error.message;
  }
}