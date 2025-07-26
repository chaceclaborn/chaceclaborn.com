// js/analytics.js - Analytics & Tracking
import { getCurrentUser } from './firebase/auth-service.js';
import databaseService from './firebase/database.js';

class Analytics {
  constructor() {
    this.startTime = Date.now();
    this.interactions = [];
    this.initialized = false;
  }

  // Initialize analytics
  init() {
    if (this.initialized) return;
    
    this.initialized = true;
    
    // Track page views
    this.trackPageView();
    
    // Track interactions
    this.setupInteractionTracking();
    
    // Track errors
    this.setupErrorTracking();
    
    // Track performance
    this.trackPerformance();
    
    console.log('📊 Analytics initialized');
  }

  // Track page views
  async trackPageView() {
    const user = getCurrentUser();
    const page = window.location.pathname;
    
    try {
      await databaseService.logPageView(user?.uid, page, {
        title: document.title,
        loadTime: Date.now() - this.startTime
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Track user interactions
  setupInteractionTracking() {
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-track]');
      if (target) {
        this.trackEvent('click', {
          element: target.dataset.track,
          text: target.textContent.substring(0, 50)
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.tagName === 'FORM') {
        this.trackEvent('form_submit', {
          formId: e.target.id || 'unknown',
          formAction: e.target.action
        });
      }
    });
  }

  // Track custom events
  async trackEvent(eventName, data = {}) {
    const user = getCurrentUser();
    
    try {
      await databaseService.logUserActivity(
        user?.uid || 'anonymous',
        eventName,
        data
      );
      
      this.interactions.push({
        event: eventName,
        timestamp: Date.now(),
        ...data
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Track errors
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: 'Unhandled Promise Rejection',
        reason: event.reason
      });
    });
  }

  // Track performance metrics
  trackPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          
          this.trackEvent('performance', {
            domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
            loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
            domInteractive: Math.round(perfData.domInteractive),
            pageLoadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart)
          });
        }, 0);
      });
    }
  }

  // Track errors
  async trackError(errorData) {
    const user = getCurrentUser();
    
    await databaseService.logError(new Error(errorData.message), {
      userId: user?.uid,
      ...errorData
    });
  }

  // Get session summary
  getSessionSummary() {
    return {
      duration: Date.now() - this.startTime,
      interactions: this.interactions.length,
      events: this.interactions
    };
  }
}

// Create singleton instance
const analytics = new Analytics();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => analytics.init());
} else {
  analytics.init();
}

export default analytics;