// js/analytics.js - Analytics & Tracking
import { getCurrentUser } from './firebase/auth-service.js';
import databaseService from './firebase/database.js';

class Analytics {
  constructor() {
    this.startTime = Date.now();
    this.interactions = [];
    this.initialized = false;
    this.maxScrollDepth = 0;
    this.currentMilestone = 0;
    this.timeMillestones = [30, 60, 120, 300, 600]; // seconds: 30s, 1m, 2m, 5m, 10m
  }

  // Initialize analytics
  init() {
    if (this.initialized) return;
    
    this.initialized = true;
    
    // Initialize database session tracking
    databaseService.initializeSession();
    
    // Track initial page view
    this.trackPageView();
    
    // Set up all tracking
    this.setupInteractionTracking();
    this.setupScrollTracking();
    this.setupTimeTracking();
    this.setupVisibilityTracking();
    this.setupErrorTracking();
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
        loadTime: Date.now() - this.startTime,
        source: this.getTrafficSource()
      });
      
      console.log('📄 Page view tracked:', page);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Get traffic source
  getTrafficSource() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for UTM parameters
    if (urlParams.get('utm_source')) {
      return {
        source: urlParams.get('utm_source'),
        medium: urlParams.get('utm_medium'),
        campaign: urlParams.get('utm_campaign')
      };
    }
    
    // Check referrer
    const referrer = document.referrer;
    if (!referrer) return { source: 'direct' };
    
    if (referrer.includes('google.com')) return { source: 'google', medium: 'organic' };
    if (referrer.includes('facebook.com')) return { source: 'facebook', medium: 'social' };
    if (referrer.includes('twitter.com')) return { source: 'twitter', medium: 'social' };
    if (referrer.includes('linkedin.com')) return { source: 'linkedin', medium: 'social' };
    
    return { source: 'referral', medium: 'referral', referrer };
  }

  // Track user interactions
  setupInteractionTracking() {
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-track]');
      if (target) {
        this.trackEvent('click', {
          element: target.dataset.track,
          text: target.textContent.substring(0, 50),
          href: target.href || null
        });
      }
      
      // Track outbound links
      if (e.target.tagName === 'A' && e.target.href && !e.target.href.includes(window.location.hostname)) {
        this.trackEvent('outbound_link', {
          url: e.target.href,
          text: e.target.textContent
        });
      }
      
      // Track download links
      if (e.target.tagName === 'A' && e.target.href && e.target.href.match(/\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i)) {
        this.trackEvent('download', {
          file: e.target.href,
          type: e.target.href.split('.').pop()
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.tagName === 'FORM') {
        this.trackEvent('form_submit', {
          formId: e.target.id || 'unknown',
          formAction: e.target.action,
          formMethod: e.target.method
        });
      }
    });
    
    // Track video interactions
    document.addEventListener('play', (e) => {
      if (e.target.tagName === 'VIDEO') {
        this.trackEvent('video_play', {
          src: e.target.src,
          currentTime: e.target.currentTime
        });
      }
    }, true);
    
    document.addEventListener('pause', (e) => {
      if (e.target.tagName === 'VIDEO') {
        this.trackEvent('video_pause', {
          src: e.target.src,
          currentTime: e.target.currentTime,
          duration: e.target.duration
        });
      }
    }, true);
  }

  // Track scroll depth
  setupScrollTracking() {
    let ticking = false;
    
    const updateScrollDepth = () => {
      const currentDepth = databaseService.getScrollDepth();
      
      if (currentDepth > this.maxScrollDepth) {
        this.maxScrollDepth = currentDepth;
        
        // Track milestones at 25%, 50%, 75%, 100%
        if (currentDepth >= 25 && this.maxScrollDepth < 25 ||
            currentDepth >= 50 && this.maxScrollDepth < 50 ||
            currentDepth >= 75 && this.maxScrollDepth < 75 ||
            currentDepth >= 100 && this.maxScrollDepth < 100) {
          
          const milestone = Math.floor(currentDepth / 25) * 25;
          databaseService.trackEngagement(
            getCurrentUser()?.uid,
            'scroll_milestone',
            { 
              depth: milestone, 
              page: window.location.pathname,
              title: document.title
            }
          );
          
          this.trackEvent('scroll_depth', { depth: milestone });
        }
      }
      
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    });
  }

  // Track time on page
  setupTimeTracking() {
    setInterval(() => {
      const timeOnPage = Math.floor((Date.now() - this.startTime) / 1000);
      
      if (this.currentMilestone < this.timeMillestones.length && 
          timeOnPage >= this.timeMillestones[this.currentMilestone]) {
        
        const milestone = this.timeMillestones[this.currentMilestone];
        databaseService.trackEngagement(
          getCurrentUser()?.uid,
          'time_milestone',
          { 
            seconds: milestone,
            formatted: this.formatTime(milestone),
            page: window.location.pathname,
            title: document.title
          }
        );
        
        this.trackEvent('time_on_page', { 
          milestone: milestone,
          formatted: this.formatTime(milestone)
        });
        
        this.currentMilestone++;
      }
    }, 1000);
  }

  // Format time for display
  formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  // Track page visibility changes
  setupVisibilityTracking() {
    let hiddenTime = 0;
    let lastHiddenTimestamp = null;
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        lastHiddenTimestamp = Date.now();
        this.trackEvent('page_hidden', {
          timeVisible: Date.now() - this.startTime - hiddenTime
        });
      } else if (lastHiddenTimestamp) {
        const timeHidden = Date.now() - lastHiddenTimestamp;
        hiddenTime += timeHidden;
        
        this.trackEvent('page_visible', {
          timeHidden: timeHidden,
          totalHiddenTime: hiddenTime
        });
        
        databaseService.trackEngagement(
          getCurrentUser()?.uid,
          'page_refocus',
          {
            timeAway: timeHidden,
            page: window.location.pathname
          }
        );
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
        {
          category: 'event',
          ...data
        }
      );
      
      this.interactions.push({
        event: eventName,
        timestamp: Date.now(),
        ...data
      });
      
      console.log('📈 Event tracked:', eventName, data);
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
          
          if (perfData) {
            const metrics = {
              domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
              loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
              domInteractive: Math.round(perfData.domInteractive),
              pageLoadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
              dnsLookup: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
              tcpConnect: Math.round(perfData.connectEnd - perfData.connectStart),
              serverResponse: Math.round(perfData.responseEnd - perfData.requestStart),
              domProcessing: Math.round(perfData.domComplete - perfData.domInteractive)
            };
            
            this.trackEvent('performance', metrics);
            
            // Track as engagement if load time is notably fast or slow
            if (metrics.pageLoadTime < 1000) {
              databaseService.trackEngagement(
                getCurrentUser()?.uid,
                'fast_page_load',
                { loadTime: metrics.pageLoadTime, page: window.location.pathname }
              );
            } else if (metrics.pageLoadTime > 5000) {
              databaseService.trackEngagement(
                getCurrentUser()?.uid,
                'slow_page_load',
                { loadTime: metrics.pageLoadTime, page: window.location.pathname }
              );
            }
          }
          
          // Track Core Web Vitals if available
          this.trackWebVitals();
        }, 0);
      });
    }
  }

  // Track Core Web Vitals
  trackWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.trackEvent('web_vitals', {
        metric: 'LCP',
        value: Math.round(lastEntry.startTime),
        rating: this.getVitalRating('LCP', lastEntry.startTime)
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.trackEvent('web_vitals', {
          metric: 'FID',
          value: Math.round(entry.processingStart - entry.startTime),
          rating: this.getVitalRating('FID', entry.processingStart - entry.startTime)
        });
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.trackEvent('web_vitals', {
        metric: 'CLS',
        value: clsValue,
        rating: this.getVitalRating('CLS', clsValue)
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Get Web Vital rating
  getVitalRating(metric, value) {
    const thresholds = {
      LCP: { good: 2500, needsImprovement: 4000 },
      FID: { good: 100, needsImprovement: 300 },
      CLS: { good: 0.1, needsImprovement: 0.25 }
    };
    
    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  // Track errors
  async trackError(errorData) {
    const user = getCurrentUser();
    
    await databaseService.logError(new Error(errorData.message), {
      userId: user?.uid,
      ...errorData
    });
    
    this.trackEvent('error', errorData);
  }

  // Get session summary
  getSessionSummary() {
    return {
      duration: Date.now() - this.startTime,
      interactions: this.interactions.length,
      events: this.interactions,
      maxScrollDepth: this.maxScrollDepth,
      currentPage: window.location.pathname,
      referrer: document.referrer
    };
  }

  // Public method to manually track events
  track(eventName, data = {}) {
    return this.trackEvent(eventName, data);
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

// Expose analytics globally for manual tracking
window.analytics = analytics;

export default analytics;