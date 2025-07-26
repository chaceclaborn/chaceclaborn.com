// js/firebase/auth-service.js - Fixed to match original working version
import { auth, db } from './config.js';
import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Current user state
let currentUser = null;

// Google provider - CREATE ONCE AT MODULE LEVEL (like your original)
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google - EXACTLY like your original
export async function signInWithGoogle() {
  try {
    console.log('🔄 Starting Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google sign-in successful:', result.user.email);
    
    await saveUserToFirestore(result.user, 'google');
    
    return result.user;
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    throw error;
  }
}

// Sign in with email - EXACTLY like your original
export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Email sign-in successful:', result.user.email);
    
    await saveUserToFirestore(result.user, 'email');
    
    return result.user;
  } catch (error) {
    console.error('❌ Email sign-in error:', error);
    throw error;
  }
}

// Create account - EXACTLY like your original
export async function createAccount(email, password, displayName = null) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Account created:', result.user.email);
    
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    await saveUserToFirestore(result.user, 'email', true);
    
    return result.user;
  } catch (error) {
    console.error('❌ Create account error:', error);
    throw error;
  }
}

// Sign out - EXACTLY like your original
export async function signOutUser() {
  try {
    await signOut(auth);
    console.log('✅ Signed out successfully');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
}

// Save user to Firestore - FROM YOUR ORIGINAL
async function saveUserToFirestore(user, method = 'unknown', isNewUser = false) {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      authMethod: method
    }, { merge: true });
    console.log('📝 User saved to Firestore');
  } catch (error) {
    console.error('❌ Firestore error:', error);
  }
}

// Auth state observer - EXACTLY like your original
export function observeAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
}

// Get current user - EXACTLY like your original
export function getCurrentUser() {
  return currentUser;
}

// Get error message - FROM YOUR ORIGINAL
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

// Additional functions from auth-service.js
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent:', email);
  } catch (error) {
    console.error('❌ Password reset error:', error);
    throw error;
  }
}

// For backward compatibility with auth-service.js imports
const authService = {
  signInWithGoogle,
  signInWithEmail,
  createAccount,
  signOut: signOutUser,
  resetPassword,
  getCurrentUser,
  isAuthenticated: () => currentUser !== null,
  onAuthStateChanged: observeAuthState,
  getErrorMessage
};

export default authService;