// js/firebase/database.js - Optimized Database Service for Firebase v12+
import { db } from './config.js';
import { 
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

class DatabaseService {
  constructor() {
    this.db = db;
    this.listeners = new Map();
    this.currentPageView = null;
    this.pageStartTime = null;
    this.lastEngagementWrite = 0;
    this.enableRealtimeListeners = !(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"); // Disable in local dev
  }

  // ==============================
  // USER PROFILE (Read & Update Only)
  // ==============================
  async getUserProfile(userId) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
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
      console.log(`✅ User profile updated: ${userId}`);
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  // ==============================
  // USER ACTIVITY LOGGING
  // ==============================
  async logUserActivity(userId, activity, metadata = {}) {
    try {
      const activityRef = collection(this.db, 'userActivity');
      const activityData = {
        userId,
        activity,
        timestamp: serverTimestamp(),
        url: window.location.href,
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
        ...metadata
      };

      const docRef = await addDoc(activityRef, activityData);

      // Update last activity on user profile
      if (userId && userId !== 'anonymous') {
        const userRef = doc(this.db, 'users', userId);
        await updateDoc(userRef, {
          lastActivity: serverTimestamp(),
          lastActivityType: activity
        });
      }

      console.log(`📝 Activity logged (${activity}): ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      throw error;
    }
  }

  // ==============================
  // ANALYTICS & PAGE VIEW TRACKING
  // ==============================
  async logPageView(userId, page, metadata = {}) {
    try {
      const analyticsRef = collection(this.db, 'analytics');
      const pageViewData = {
        userId: userId || 'anonymous',
        page,
        timestamp: serverTimestamp(),
        referrer: document.referrer || 'direct',
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        sessionId: this.getSessionId(),
        duration: 0,
        ...metadata
      };

      const docRef = await addDoc(analyticsRef, pageViewData);

      this.currentPageView = docRef.id;
      this.pageStartTime = Date.now();

      console.log(`📄 Page view logged: ${page}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error logging page view:', error);
      throw error;
    }
  }

  async updatePageDuration() {
    if (!this.currentPageView || !this.pageStartTime) return;
    try {
      const duration = Math.floor((Date.now() - this.pageStartTime) / 1000);
      const pageRef = doc(this.db, 'analytics', this.currentPageView);
      await updateDoc(pageRef, { duration });
      console.log(`⏱️ Page duration updated: ${duration}s`);
    } catch (error) {
      console.error('❌ Error updating page duration:', error);
    }
  }

  // ==============================
  // ENGAGEMENT TRACKING (Throttled)
  // ==============================
  async trackEngagement(userId, engagementType, details = {}) {
    const now = Date.now();
    if (now - this.lastEngagementWrite < 2000) return; // Throttle to 1 event every 2s
    this.lastEngagementWrite = now;

    try {
      const engagementRef = collection(this.db, 'engagement');
      await addDoc(engagementRef, {
        userId: userId || 'anonymous',
        type: engagementType,
        timestamp: serverTimestamp(),
        sessionId: this.getSessionId(),
        details,
        context: this.getEngagementContext()
      });
      console.log(`📊 Engagement tracked: ${engagementType}`);
    } catch (error) {
      console.error('❌ Error tracking engagement:', error);
    }
  }

  // ==============================
  // USER STATS & DASHBOARD
  // ==============================
  async getUserStats(userId) {
    try {
      const stats = { activities: [], pageViews: [], totalPageViews: 0 };

      const activityQuery = query(
        collection(this.db, 'userActivity'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const activitySnapshot = await getDocs(activityQuery);
      activitySnapshot.forEach(doc => stats.activities.push({ id: doc.id, ...doc.data() }));

      const pageQuery = query(
        collection(this.db, 'analytics'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const pageSnapshot = await getDocs(pageQuery);
      pageSnapshot.forEach(doc => stats.pageViews.push({ id: doc.id, ...doc.data() }));

      stats.totalPageViews = stats.pageViews.length;
      stats.lastActive = stats.activities[0]?.timestamp || null;

      return stats;
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      throw error;
    }
  }

  // ==============================
  // REAL-TIME LISTENERS (Optional)
  // ==============================
  subscribeToUserProfile(userId, callback) {
    if (!this.enableRealtimeListeners) {
      console.log('⚠️ Realtime listeners disabled in local dev');
      return () => {};
    }

    const userRef = doc(this.db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, snapshot => {
      if (snapshot.exists()) callback({ id: snapshot.id, ...snapshot.data() });
    });
    this.listeners.set(`user-${userId}`, unsubscribe);
    return unsubscribe;
  }

  unsubscribeAll() {
    this.listeners.forEach(unsub => unsub());
    this.listeners.clear();
  }

  // ==============================
  // HELPER METHODS
  // ==============================
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  getEngagementContext() {
    return {
      timeOnSite: Date.now() - parseInt(sessionStorage.getItem('sessionStart') || Date.now().toString(), 10),
      pageDepth: JSON.parse(sessionStorage.getItem('viewedPages') || '[]').length,
      scrollDepth: this.getScrollDepth(),
    };
  }

  getScrollDepth() {
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    return Math.round(((scrollTop + windowHeight) / docHeight) * 100);
  }
}

export default new DatabaseService();
