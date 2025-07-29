// js/firebase/auth-service.js - Authentication & User Profile Management (v12+)
import { auth, db } from './config.js';
import { 
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { 
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import databaseService from './database.js';

const provider = new GoogleAuthProvider();

/**
 * Google Sign-In
 */
export async function signInWithGoogle() {
  try {
    console.log('🔄 Starting Google sign-in...');
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Ensure Firestore user profile exists
    await createOrUpdateUserProfile(user);

    console.log(`✅ Google sign-in successful: ${user.email}`);
    return user;
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    throw error;
  }
}

/**
 * Email/Password Sign-In
 */
export async function signInWithEmail(email, password) {
  try {
    console.log(`🔄 Signing in with email: ${email}`);
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await createOrUpdateUserProfile(user);

    console.log(`✅ Email sign-in successful: ${user.email}`);
    return user;
  } catch (error) {
    console.error('❌ Email sign-in error:', error);
    throw error;
  }
}

/**
 * Create Account (Email/Password)
 */
export async function createAccount(email, password) {
  try {
    console.log(`🔄 Creating account for: ${email}`);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await createOrUpdateUserProfile(user);

    console.log(`✅ Account created: ${user.email}`);
    return user;
  } catch (error) {
    console.error('❌ Account creation error:', error);
    throw error;
  }
}

/**
 * Sign Out
 */
export async function signOutUser() {
  try {
    console.log('🔄 Signing out user...');
    await signOut(auth);
    console.log('✅ User signed out');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
}

/**
 * Auth State Observer
 */
export function observeAuthState(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log(`👤 Auth state: Signed in as ${user.email}`);
      // Ensure profile is initialized before firing callback
      await createOrUpdateUserProfile(user);
    } else {
      console.log('🚪 Auth state: Signed out');
    }
    callback(user);
  });
}

/**
 * Create or Update User Profile (Single Source of Truth)
 */
async function createOrUpdateUserProfile(user) {
  if (!user || !user.uid) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile if it doesn't exist
      const newProfile = {
        email: user.email,
        displayName: user.displayName || 'New User',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        provider: user.providerData[0]?.providerId || 'unknown',
        tier: 'authenticated', // default tier, adjusted later in auth-tiers
        testData: false
      };
      await setDoc(userRef, newProfile);
      console.log(`🆕 User profile created: ${user.email}`);
    } else {
      // Update last login if profile exists
      await setDoc(
        userRef,
        { lastLogin: serverTimestamp(), photoURL: user.photoURL || '' },
        { merge: true }
      );
      console.log(`🔄 User profile updated: ${user.email}`);
    }
  } catch (error) {
    console.error('❌ Error creating/updating user profile:', error);
    throw error;
  }
}

/**
 * Get Current Authenticated User
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Utility: Error Message Mapper
 */
export function getErrorMessage(error) {
  const errorMap = {
    'auth/email-already-in-use': 'This email is already in use.',
    'auth/invalid-email': 'The email address is not valid.',
    'auth/user-disabled': 'This user has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Try again.',
    'auth/popup-blocked': 'Please allow popups for this site.',
    'auth/popup-closed-by-user': 'The popup was closed before sign-in.',
  };
  return errorMap[error.code] || 'An unexpected error occurred.';
}

export { createOrUpdateUserProfile }; // Exported for tier init modules if needed
