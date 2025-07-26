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
    this.currentPageView = null;
    this.pageStartTime = null;
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
        device: this.getDeviceInfo(),
        browser: this.getBrowserInfo(),
        ...metadata
      };
      
      const docRef = await addDoc(activityRef, activityData);
      
      // Also update user's last activity
      if (userId && userId !== 'anonymous') {
        const userRef = doc(this.db, 'users', userId);
        await updateDoc(userRef, {
          lastActivity: serverTimestamp(),
          lastActivityType: activity
        });
      }
      
      console.log('📝 Activity logged:', activity, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      throw error;
    }
  }

  async logPageView(userId, page, metadata = {}) {
    try {
      const isUniqueView = this.isUniquePageView(page);
      
      const analyticsRef = collection(this.db, 'analytics');
      const pageViewData = {
        userId: userId || 'anonymous',
        page,
        timestamp: serverTimestamp(),
        referrer: document.referrer,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        sessionId: this.getSessionId(),
        duration: 0,
        isUnique: isUniqueView,
        entryType: this.getEntryType(),
        performance: this.getPerformanceMetrics(),
        ...metadata
      };
      
      const docRef = await addDoc(analyticsRef, pageViewData);
      
      // Store reference for duration tracking
      this.currentPageView = docRef.id;
      this.pageStartTime = Date.now();
      
      // Track in session
      this.addToSession('pageViews', page);
      
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

  // ========== ENGAGEMENT TRACKING ==========
  async trackEngagement(userId, engagementType, details = {}) {
    try {
      const engagementRef = collection(this.db, 'engagement');
      await addDoc(engagementRef, {
        userId: userId || 'anonymous',
        type: engagementType,
        timestamp: serverTimestamp(),
        sessionId: this.getSessionId(),
        details,
        ...this.getEngagementContext()
      });
    } catch (error) {
      console.error('❌ Error tracking engagement:', error);
    }
  }

  // ========== DASHBOARD DATA ==========
  async getDashboardStats(userId) {
    try {
      const stats = {
        user: await this.getUserProfile(userId),
        recentActivity: await this.getRecentActivity(userId, 5),
        sessionInfo: this.getCurrentSessionInfo(),
        engagement: await this.getEngagementStats(userId)
      };
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getRecentActivity(userId, limit = 10) {
    const activityQuery = query(
      collection(this.db, 'userActivity'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(activityQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getEngagementStats(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const engagementQuery = query(
      collection(this.db, 'analytics'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(engagementQuery);
    const pageViews = snapshot.docs.map(doc => doc.data());
    
    return {
      totalPageViews: pageViews.length,
      uniquePages: [...new Set(pageViews.map(pv => pv.page))].length,
      averageDuration: pageViews.reduce((acc, pv) => acc + (pv.duration || 0), 0) / (pageViews.length || 1),
      mostVisitedPage: this.getMostVisited(pageViews)
    };
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

  getDeviceInfo() {
    const ua = navigator.userAgent;
    return {
      isMobile: /Mobile|Android|iPhone/i.test(ua),
      isTablet: /iPad|Tablet/i.test(ua),
      isDesktop: !(/Mobile|Android|iPhone|iPad|Tablet/i.test(ua)),
      platform: navigator.platform,
      vendor: navigator.vendor
    };
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = '';
    
    if (ua.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
      browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '';
    } else if (ua.indexOf('Safari') > -1) {
      browserName = 'Safari';
      browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '';
    } else if (ua.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '';
    } else if (ua.indexOf('Edge') > -1) {
      browserName = 'Edge';
      browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || '';
    }
    
    return { name: browserName, version: browserVersion };
  }

  isUniquePageView(page) {
    const viewedPages = JSON.parse(sessionStorage.getItem('viewedPages') || '[]');
    if (!viewedPages.includes(page)) {
      viewedPages.push(page);
      sessionStorage.setItem('viewedPages', JSON.stringify(viewedPages));
      return true;
    }
    return false;
  }

  getEntryType() {
    const referrer = document.referrer;
    if (!referrer) return 'direct';
    if (referrer.includes(window.location.hostname)) return 'internal';
    if (referrer.includes('google.com')) return 'search';
    if (referrer.includes('facebook.com') || referrer.includes('twitter.com')) return 'social';
    return 'referral';
  }

  getPerformanceMetrics() {
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        return {
          loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
          domReady: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
          firstPaint: Math.round(perfData.domInteractive - perfData.fetchStart)
        };
      }
    }
    return null;
  }

  addToSession(type, value) {
    const session = JSON.parse(sessionStorage.getItem('userSession') || '{}');
    if (!session[type]) session[type] = [];
    session[type].push({ value, timestamp: Date.now() });
    sessionStorage.setItem('userSession', JSON.stringify(session));
  }

  getEngagementContext() {
    const sessionStart = parseInt(sessionStorage.getItem('sessionStart') || Date.now().toString());
    return {
      timeOnSite: Date.now() - sessionStart,
      pageDepth: JSON.parse(sessionStorage.getItem('viewedPages') || '[]').length,
      scrollDepth: this.getScrollDepth(),
      interactionCount: parseInt(sessionStorage.getItem('interactionCount') || '0')
    };
  }

  getScrollDepth() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
  }

  getCurrentSessionInfo() {
    const sessionStart = parseInt(sessionStorage.getItem('sessionStart') || Date.now().toString());
    return {
      sessionId: this.getSessionId(),
      duration: Date.now() - sessionStart,
      pageViews: JSON.parse(sessionStorage.getItem('viewedPages') || '[]'),
      interactions: parseInt(sessionStorage.getItem('interactionCount') || '0')
    };
  }

  getMostVisited(pageViews) {
    const pageCounts = {};
    pageViews.forEach(pv => {
      pageCounts[pv.page] = (pageCounts[pv.page] || 0) + 1;
    });
    
    return Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([page, count]) => ({ page, count }));
  }

  initializeSession() {
    if (!sessionStorage.getItem('sessionStart')) {
      sessionStorage.setItem('sessionStart', Date.now().toString());
      sessionStorage.setItem('sessionId', this.getSessionId());
      sessionStorage.setItem('interactionCount', '0');
      
      // Track session start
      this.logUserActivity('anonymous', 'session_start', {
        entryPoint: window.location.pathname,
        referrer: document.referrer
      });
    }
    
    // Track interactions
    ['click', 'scroll', 'keypress'].forEach(event => {
      document.addEventListener(event, () => {
        const count = parseInt(sessionStorage.getItem('interactionCount') || '0');
        sessionStorage.setItem('interactionCount', (count + 1).toString());
      }, { once: false, passive: true });
    });
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

// Initialize session on load
databaseService.initializeSession();

export default databaseService;