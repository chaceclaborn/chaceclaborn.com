// js/firebase/auth-service.js - Consolidated Authentication Service
// Single source of truth for all authentication logic

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
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { USER_TIERS_CONFIG } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('AuthService');
const provider = new GoogleAuthProvider();

class AuthenticationService {
  constructor() {
    this.currentUser = null;
    this.currentTier = 'public';
    this.authStateListeners = new Set();
    this.tierCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      logger.info('Starting Google sign-in...');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create or update user profile
      await this.createOrUpdateUserProfile(user);

      logger.success(`Google sign-in successful: ${user.email}`);
      return user;
    } catch (error) {
      // Don't log cancelled popups as errors
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request') {
        logger.error('Google sign-in error:', error);
      }
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email, password) {
    try {
      logger.info(`Signing in with email: ${email}`);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await this.createOrUpdateUserProfile(user);

      logger.success(`Email sign-in successful: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Email sign-in error:', error);
      throw error;
    }
  }

  /**
   * Create new account with email and password
   */
  async createAccount(email, password, displayName = null) {
    try {
      logger.info(`Creating account for: ${email}`);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Set display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      await this.createOrUpdateUserProfile(user);

      logger.success(`Account created: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Account creation error:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      logger.info('Signing out user...');
      await signOut(auth);
      
      // Clear tier cache
      this.tierCache.clear();
      this.currentUser = null;
      this.currentTier = 'public';
      
      logger.success('User signed out');
    } catch (error) {
      logger.error('Sign out error:', error);
      throw error;
    }
  }

  // ============================================
  // USER PROFILE MANAGEMENT
  // ============================================

  /**
   * Create or update user profile in Firestore
   */
  async createOrUpdateUserProfile(user) {
    if (!user || !user.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user profile
        const tier = this.determineUserTier(user.email);
        const newProfile = {
          email: user.email,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          provider: user.providerData[0]?.providerId || 'unknown',
          tier: tier,
          testData: false
        };
        
        await setDoc(userRef, newProfile);
        logger.success(`User profile created: ${user.email} (${tier})`);
        
        // Cache the tier
        this.tierCache.set(user.uid, {
          tier,
          timestamp: Date.now()
        });
      } else {
        // Update existing profile
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
          photoURL: user.photoURL || ''
        });
        logger.info(`User profile updated: ${user.email}`);
      }
    } catch (error) {
      logger.error('Error creating/updating user profile:', error);
      throw error;
    }
  }

  // ============================================
  // TIER MANAGEMENT
  // ============================================

  /**
   * Determine user tier based on email
   */
  determineUserTier(email) {
    const normalizedEmail = email?.toLowerCase();
    
    if (!normalizedEmail) return 'public';
    
    // Check each tier configuration
    if (USER_TIERS_CONFIG.ADMIN.emails.includes(normalizedEmail)) {
      return 'admin';
    }
    if (USER_TIERS_CONFIG.GIRLFRIEND.emails.includes(normalizedEmail)) {
      return 'girlfriend';
    }
    if (USER_TIERS_CONFIG.FAMILY.emails.includes(normalizedEmail)) {
      return 'family';
    }
    
    // Default to authenticated for any logged-in user
    return 'authenticated';
  }

  /**
   * Get user tier (with caching)
   */
  async getUserTier(userId = null) {
    const uid = userId || this.currentUser?.uid;
    
    if (!uid) return 'public';

    // Check cache first
    const cached = this.tierCache.get(uid);
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      return cached.tier;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const tier = userDoc.data().tier || 'authenticated';
        
        // Update cache
        this.tierCache.set(uid, {
          tier,
          timestamp: Date.now()
        });
        
        return tier;
      }
      
      return 'authenticated';
    } catch (error) {
      logger.error('Error fetching user tier:', error);
      return 'authenticated';
    }
  }

  /**
   * Get redirect path based on tier
   */
  getRedirectPath(tier) {
    // Only redirect from homepage
    const currentPath = window.location.pathname;
    const isHomepage = currentPath === '/' || 
                       currentPath === '/index.html' || 
                       currentPath.endsWith('/');
    
    if (!isHomepage) {
      return null;
    }
    
    // Get redirect from config
    const tierConfig = Object.values(USER_TIERS_CONFIG).find(
      config => config.name === tier
    );
    
    return tierConfig?.redirectPath || null;
  }

  // ============================================
  // AUTH STATE MANAGEMENT
  // ============================================

  /**
   * Initialize auth state observer
   */
  initAuthStateObserver() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        logger.info(`Auth state: Signed in as ${user.email}`);
        
        // Ensure profile exists
        await this.createOrUpdateUserProfile(user);
        
        // Get and cache user tier
        this.currentTier = await this.getUserTier(user.uid);
      } else {
        logger.info('Auth state: Signed out');
        this.currentTier = 'public';
      }
      
      // Notify all listeners
      this.notifyAuthStateListeners(user);
    });
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback) {
    this.authStateListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners.delete(callback);
    };
  }

  /**
   * Notify all auth state listeners
   */
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        logger.error('Error in auth state listener:', error);
      }
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current user tier
   */
  getCurrentTier() {
    return this.currentTier;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Check if user has specific tier
   */
  hasTier(requiredTier) {
    const tierHierarchy = {
      'public': 0,
      'authenticated': 1,
      'family': 2,
      'girlfriend': 3,
      'admin': 4
    };
    
    const userLevel = tierHierarchy[this.currentTier] || 0;
    const requiredLevel = tierHierarchy[requiredTier] || 0;
    
    // Admin can access everything
    if (this.currentTier === 'admin') return true;
    
    // Check if user tier meets requirement
    return userLevel >= requiredLevel;
  }

  /**
   * Get error message for auth errors
   */
  getErrorMessage(error) {
    const errorMap = {
      'auth/email-already-in-use': 'This email is already in use.',
      'auth/invalid-email': 'The email address is not valid.',
      'auth/user-disabled': 'This user has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Try again.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-blocked': 'Please allow popups for this site.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled.',
      'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
      'auth/requires-recent-login': 'Please sign in again to continue.',
      'permission-denied': 'You don\'t have permission to access this.'
    };
    
    return errorMap[error.code] || 'An unexpected error occurred. Please try again.';
  }
}

// Create singleton instance
const authService = new AuthenticationService();

// Initialize auth state observer
authService.initAuthStateObserver();

// Export service instance and methods
export default authService;

// Export individual methods for backward compatibility
export const signInWithGoogle = () => authService.signInWithGoogle();
export const signInWithEmail = (email, password) => authService.signInWithEmail(email, password);
export const createAccount = (email, password, displayName) => authService.createAccount(email, password, displayName);
export const signOutUser = () => authService.signOut();
export const getCurrentUser = () => authService.getCurrentUser();
export const getUserTier = (userId) => authService.getUserTier(userId);
export const observeAuthState = (callback) => authService.onAuthStateChanged(callback);
export const getErrorMessage = (error) => authService.getErrorMessage(error);