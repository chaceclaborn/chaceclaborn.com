// js/firebase/database.js - Comprehensive Database Service
import { db } from './config.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class DatabaseService {
  constructor() {
    this.db = db;
    this.listeners = new Map();
  }

  // ========== USER MANAGEMENT ==========
  async createUserProfile(user) {
    try {
      const userRef = doc(this.db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        loginCount: 1,
        role: 'member',
        isActive: true,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        },
        metadata: {
          browser: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        }
      };
      
      await setDoc(userRef, userData);
      console.log('✅ User profile created:', user.uid);
      return userData;
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ User profile updated:', userId);
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      throw error;
    }
  }

  // ========== ACTIVITY LOGGING ==========
  async logUserActivity(userId, activity, metadata = {}) {
    try {
      const activityRef = collection(this.db, 'userActivity');
      const activityData = {
        userId,
        activity,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId(),
        ...metadata
      };
      
      const docRef = await addDoc(activityRef, activityData);
      console.log('📝 Activity logged:', activity, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      throw error;
    }
  }

  async logPageView(userId, page, metadata = {}) {
    try {
      const analyticsRef = collection(this.db, 'analytics');
      const pageViewData = {
        userId: userId || 'anonymous',
        page,
        timestamp: serverTimestamp(),
        referrer: document.referrer,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        sessionId: this.getSessionId(),
        duration: 0, // Will be updated on page leave
        ...metadata
      };
      
      const docRef = await addDoc(analyticsRef, pageViewData);
      
      // Store reference for duration tracking
      this.currentPageView = docRef.id;
      this.pageStartTime = Date.now();
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error logging page view:', error);
      throw error;
    }
  }

  async updatePageDuration() {
    if (this.currentPageView && this.pageStartTime) {
      try {
        const duration = Math.floor((Date.now() - this.pageStartTime) / 1000);
        const pageRef = doc(this.db, 'analytics', this.currentPageView);
        await updateDoc(pageRef, { duration });
        console.log('⏱️ Page duration updated:', duration, 'seconds');
      } catch (error) {
        console.error('❌ Error updating page duration:', error);
      }
    }
  }

  // ========== LOGIN TRACKING ==========
  async updateLoginStats(userId) {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        loginCount: increment(1),
        'metadata.lastUserAgent': navigator.userAgent
      });
      
      // Log login event
      await this.logUserActivity(userId, 'login');
      
      console.log('✅ Login stats updated:', userId);
    } catch (error) {
      console.error('❌ Error updating login stats:', error);
      throw error;
    }
  }

  // ========== USER STATS & ANALYTICS ==========
  async getUserStats(userId) {
    try {
      const stats = {
        activities: [],
        pageViews: [],
        totalPageViews: 0,
        lastActive: null
      };

      // Get recent activities
      const activityQuery = query(
        collection(this.db, 'userActivity'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      
      const activitySnapshot = await getDocs(activityQuery);
      activitySnapshot.forEach((doc) => {
        stats.activities.push({ id: doc.id, ...doc.data() });
      });

      // Get page views
      const pageQuery = query(
        collection(this.db, 'analytics'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const pageSnapshot = await getDocs(pageQuery);
      pageSnapshot.forEach((doc) => {
        stats.pageViews.push({ id: doc.id, ...doc.data() });
      });

      stats.totalPageViews = stats.pageViews.length;
      stats.lastActive = stats.activities[0]?.timestamp || null;

      return stats;
    } catch (error) {
      console.error('❌ Error getting user stats:', error);
      throw error;
    }
  }

  // ========== REAL-TIME LISTENERS ==========
  subscribeToUserProfile(userId, callback) {
    const userRef = doc(this.db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
    
    this.listeners.set(`user-${userId}`, unsubscribe);
    return unsubscribe;
  }

  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }

  // ========== HELPER METHODS ==========
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // ========== ERROR LOGGING ==========
  async logError(error, context = {}) {
    try {
      const errorRef = collection(this.db, 'errors');
      await addDoc(errorRef, {
        message: error.message,
        stack: error.stack,
        timestamp: serverTimestamp(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      });
    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

// Track page duration on unload
window.addEventListener('beforeunload', () => {
  databaseService.updatePageDuration();
});

export default databaseService;