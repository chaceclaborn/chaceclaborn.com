// auth-service.js - Authentication Service Module
import { auth, db } from './config.js';
import { 
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { 
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Auth state management
class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    this.isInitialized = false;
    
    // Initialize auth state observer
    this.initAuthStateObserver();
  }
  
  // Initialize auth state observer
  initAuthStateObserver() {
    onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      
      this.currentUser = user;
      this.isInitialized = true;
      
      if (user) {
        await this.updateUserProfile(user);
      }
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(user));
    });
    
    // Check for redirect result on page load
    this.checkRedirectResult();
  }
  
  // Check for redirect result
  async checkRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        console.log('✅ Redirect sign-in successful:', result.user.email);
      }
    } catch (error) {
      console.error('❌ Redirect result error:', error);
    }
  }
  
  // Add auth state listener
  onAuthStateChanged(listener) {
    this.authStateListeners.push(listener);
    // Immediately call with current state if initialized
    if (this.isInitialized) {
      listener(this.currentUser);
    }
  }
  
  // Google Sign In
  async signInWithGoogle(usePopup = true) {
    const provider = new GoogleAuthProvider();
    
    // Add scopes for additional permissions
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    
    // Set custom parameters
    provider.setCustomParameters({
      prompt: 'select_account' // Force account selection
    });
    
    try {
      let result;
      
      if (usePopup) {
        console.log('🔄 Attempting Google sign-in with popup...');
        result = await signInWithPopup(auth, provider);
      } else {
        console.log('🔄 Attempting Google sign-in with redirect...');
        // For redirect, we just initiate it - result comes on page reload
        await signInWithRedirect(auth, provider);
        return; // No immediate result with redirect
      }
      
      // This code only runs for popup
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      
      console.log('✅ Google sign-in successful:', user.email);
      console.log('📋 Access token obtained');
      
      return { user, token };
      
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      this.handleAuthError(error);
      throw error;
    }
  }
  
  // Email/Password Sign In
  async signInWithEmail(email, password) {
    try {
      console.log('🔄 Attempting email sign-in...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email sign-in successful:', result.user.email);
      return result.user;
    } catch (error) {
      console.error('❌ Email sign-in error:', error);
      this.handleAuthError(error);
      throw error;
    }
  }
  
  // Create Account
  async createAccount(email, password) {
    try {
      console.log('🔄 Creating new account...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Account created successfully:', result.user.email);
      return result.user;
    } catch (error) {
      console.error('❌ Create account error:', error);
      this.handleAuthError(error);
      throw error;
    }
  }
  
  // Sign Out
  async signOut() {
    try {
      console.log('🔄 Signing out...');
      await signOut(auth);
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }
  
  // Update user profile in Firestore
  async updateUserProfile(user) {
    if (!db) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user profile
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          provider: user.providerData[0]?.providerId || 'password'
        });
        console.log('📝 New user profile created in Firestore');
      } else {
        // Update last login
        await updateDoc(userRef, {
          lastLogin: serverTimestamp()
        });
        console.log('📝 User profile updated');
      }
    } catch (error) {
      console.error('❌ Firestore error:', error);
    }
  }
  
  // Handle authentication errors
  handleAuthError(error) {
    const errorMessages = {
      'auth/popup-closed-by-user': 'Sign-in popup was closed',
      'auth/cancelled-popup-request': 'Another popup is already open',
      'auth/popup-blocked': 'Sign-in popup was blocked by the browser',
      'auth/unauthorized-domain': 'This domain is not authorized for sign-in',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address',
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/network-request-failed': 'Network error - please check your connection',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method'
    };
    
    const message = errorMessages[error.code] || error.message;
    console.error(`🚨 Auth Error [${error.code}]: ${message}`);
    
    // Return user-friendly message
    return message;
  }
  
  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }
  
  // Wait for auth to initialize
  waitForAuth() {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve(this.currentUser);
      } else {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      }
    });
  }
}

// Create singleton instance
const authService = new AuthService();

// Export service
export default authService;