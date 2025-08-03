// js/feedback-widget.js - Fully Responsive Feedback Widget
// Professional dynamic styling - Perfect on PC, optimized for mobile

class FeedbackWidget {
  constructor() {
    console.log('🎯 Initializing Enhanced Feedback Widget...');
    this.isOpen = false;
    this.isExpanded = false;
    this.currentRating = 0;
    this.hasRated = false;
    this.auth = null;
    this.db = null;
    this.currentUser = null;
    this.initialized = false;
    this.authStateResolved = false;
    this.statsUnsubscribe = null;
    this.overallRating = 0;
    this.totalRatings = 0;
    this.isMobile = window.innerWidth <= 768;
    this.init();
  }

  async init() {
    try {
      console.log('📦 Feedback Widget: Starting initialization...');
      
      // Create widget HTML immediately
      this.createWidget();
      console.log('✅ Feedback Widget: HTML created');
      
      // Wait for Firebase to be ready
      await this.waitForFirebase();
      console.log('✅ Feedback Widget: Firebase connected');
      
      // Setup event listeners
      this.setupEventListeners();
      console.log('✅ Feedback Widget: Event listeners attached');
      
      // Wait for auth state to be resolved
      await this.waitForAuthState();
      console.log('✅ Feedback Widget: Auth state resolved');
      
      // Subscribe to rating updates
      this.subscribeToRatings();
      
      // Check if user already rated
      if (this.currentUser) {
        await this.checkUserRating();
      }
      
      // Add admin navigation if admin
      this.updateAdminNavigation();
      
      this.initialized = true;
      console.log('🎉 Feedback Widget: Fully initialized!');
      
      // Make visible with animation
      setTimeout(() => {
        const widget = document.getElementById('feedback-widget');
        if (widget) {
          widget.style.opacity = '1';
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Feedback Widget Error:', error);
    }
  }

  async waitForFirebase() {
    console.log('⏳ Waiting for Firebase...');
    
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max
    
    while (attempts < maxAttempts) {
      // Check if Firebase is exposed globally
      if (window.auth && window.db) {
        console.log('✅ Found Firebase globally');
        this.auth = window.auth;
        this.db = window.db;
        return;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Firebase not found after 5 seconds. Make sure Firebase is loaded.');
  }

  async waitForAuthState() {
    console.log('⏳ Waiting for auth state to resolve...');
    
    return new Promise((resolve) => {
      import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js').then(({ onAuthStateChanged }) => {
        const unsubscribe = onAuthStateChanged(this.auth, (user) => {
          console.log('👤 Auth state received:', user ? user.email : 'not signed in');
          this.currentUser = user;
          this.authStateResolved = true;
          this.onAuthChange(user);
          
          // Keep listening for auth changes
          resolve();
        });
      }).catch(error => {
        console.error('Error importing auth module:', error);
        resolve(); // Resolve anyway to not block widget
      });
    });
  }

  updateAdminNavigation() {
    // Check if user is admin
    if (this.currentUser && this.currentUser.email === 'chaceclaborn@gmail.com') {
      // Add admin link to main navigation if not already there
      const mainNav = document.getElementById('mainNav');
      if (mainNav && !document.getElementById('admin-nav-link')) {
        // Check if we're in pages folder or root
        const isInPages = window.location.pathname.includes('/pages/');
        const adminPath = isInPages ? 'admin.html' : 'pages/admin.html';
        
        // Create admin link with special styling
        const adminLink = document.createElement('a');
        adminLink.href = adminPath;
        adminLink.className = 'nav-link admin-special-link';
        adminLink.id = 'admin-nav-link';
        adminLink.innerHTML = '<i class="fas fa-shield-alt"></i> Admin';
        
        // Insert before the tier navigation or at the end
        const tierNav = mainNav.querySelector('.tier-nav');
        if (tierNav) {
          mainNav.insertBefore(adminLink, tierNav);
        } else {
          mainNav.appendChild(adminLink);
        }
      }
      
      // Also add to mobile menu if exists
      const mobileNav = document.querySelector('.mobile-nav-menu');
      if (mobileNav && !document.getElementById('mobile-admin-link')) {
        const isInPages = window.location.pathname.includes('/pages/');
        const adminPath = isInPages ? 'admin.html' : 'pages/admin.html';
        
        const mobileAdminLink = document.createElement('a');
        mobileAdminLink.href = adminPath;
        mobileAdminLink.className = 'mobile-nav-link admin-special-link';
        mobileAdminLink.id = 'mobile-admin-link';
        mobileAdminLink.innerHTML = '<i class="fas fa-shield-alt"></i> Admin Dashboard';
        
        mobileNav.appendChild(mobileAdminLink);
      }
    }
  }

  createWidget() {
    // Remove any existing widget first
    const existingWidget = document.getElementById('feedback-widget');
    if (existingWidget) {
      existingWidget.remove();
    }
    
    // Create widget container with mobile-optimized design
    const widgetHTML = `
      <!-- Enhanced Feedback Widget -->
      <div id="feedback-widget" class="feedback-widget" style="opacity: 0;">
        
        <!-- Collapsed View (Always Visible) -->
        <div id="feedback-collapsed" class="feedback-collapsed">
          <button id="feedback-toggle" class="feedback-toggle" aria-label="Rate this site">
            <div class="toggle-content">
              <div class="site-rating-display">
                <div class="rating-label">Site Rating</div>
                <div class="rating-value-display">
                  <span id="collapsed-rating">0.0</span>
                  <div class="star-display">
                    <i class="fas fa-star"></i>
                  </div>
                </div>
                <div class="rating-count" id="collapsed-count">0 ratings</div>
              </div>
              <div class="user-rating-indicator" id="user-rated-indicator" style="display: none;">
                <i class="fas fa-check-circle"></i>
                <span>You rated <span id="collapsed-user-rating">0</span> ⭐</span>
              </div>
              <div class="expand-icon">
                <i class="fas fa-chevron-up"></i>
              </div>
            </div>
          </button>
        </div>
        
        <!-- Expanded Panel -->
        <div id="feedback-panel" class="feedback-panel">
          <!-- Header -->
          <div class="feedback-header">
            <h3><i class="fas fa-star"></i> Rate This Portfolio</h3>
            <button id="feedback-close" class="feedback-close" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Overall Stats Section -->
          <div class="stats-section">
            <div class="stat-row">
              <div class="stat-box overall-stat">
                <div class="stat-title">Overall Rating</div>
                <div class="big-rating">
                  <span id="widget-avg-rating">0.0</span>
                  <span class="rating-suffix">/5</span>
                </div>
                <div class="avg-stars" id="widget-avg-stars">
                  <i class="far fa-star"></i>
                  <i class="far fa-star"></i>
                  <i class="far fa-star"></i>
                  <i class="far fa-star"></i>
                  <i class="far fa-star"></i>
                </div>
                <div class="stat-count">
                  Based on <span id="widget-rating-count">0</span> ratings
                </div>
              </div>
              
              <div class="stat-box your-stat" id="your-rating-display" style="display: none;">
                <div class="stat-title">Your Rating</div>
                <div class="big-rating">
                  <span id="widget-your-rating">0</span>
                  <span class="rating-suffix">/5</span>
                </div>
                <div class="your-stars" id="widget-your-stars">
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                </div>
                <div class="stat-count">
                  <a href="#" id="change-rating-link">Change rating</a>
                </div>
              </div>
            </div>
          </div>
          
          <!-- User Rating Section -->
          <div class="feedback-rate">
            <p id="rate-prompt">Click to rate:</p>
            <div class="rate-stars" id="widget-rate-stars">
              <i class="far fa-star" data-rating="1"></i>
              <i class="far fa-star" data-rating="2"></i>
              <i class="far fa-star" data-rating="3"></i>
              <i class="far fa-star" data-rating="4"></i>
              <i class="far fa-star" data-rating="5"></i>
            </div>
            <p class="rate-message" id="widget-rate-message"></p>
          </div>
          
          <!-- Feedback Form (Collapsible) -->
          <div class="feedback-form-section">
            <button class="form-toggle" id="form-toggle">
              <i class="fas fa-comment"></i> Leave a comment (optional)
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="form-content" id="form-content" style="display: none;">
              <form id="widget-feedback-form" class="widget-feedback-form">
                <textarea 
                  id="widget-feedback-text" 
                  placeholder="Share your thoughts..."
                  maxlength="500"
                  rows="3"
                ></textarea>
                <div class="form-footer">
                  <span class="char-count">
                    <span id="widget-char-count">0</span>/500
                  </span>
                  <button type="submit" class="btn-submit">
                    <i class="fas fa-paper-plane"></i> Send
                  </button>
                </div>
              </form>
              <p class="form-message" id="widget-form-message"></p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add enhanced styles with professional responsive design
    if (!document.getElementById('feedback-widget-styles')) {
      const styles = `
        <style id="feedback-widget-styles">
          /* Admin Navigation Special Styling */
          .admin-special-link {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
            color: white !important;
            font-weight: 600 !important;
            padding: 8px 16px !important;
            border-radius: 8px !important;
            margin: 0 4px !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            transition: all 0.3s !important;
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3) !important;
          }
          
          .admin-special-link:hover {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4) !important;
          }
          
          .admin-special-link i {
            font-size: 14px;
          }
          
          /* Enhanced Feedback Widget - Desktop First (Perfect as is) */
          .feedback-widget {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            transition: opacity 0.5s ease;
            user-select: none;
          }
          
          /* Collapsed View - Always Visible */
          .feedback-collapsed {
            background: linear-gradient(135deg, #617140 0%, #4a5a30 100%);
            border-radius: 16px;
            box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          
          .feedback-collapsed:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
          }
          
          .feedback-toggle {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            width: 100%;
            text-align: left;
          }
          
          .toggle-content {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 15px 20px;
          }
          
          .site-rating-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 80px;
          }
          
          .rating-label {
            font-size: 11px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          
          .rating-value-display {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 28px;
            font-weight: bold;
          }
          
          .star-display {
            color: #ffc107;
            font-size: 20px;
          }
          
          .rating-count {
            font-size: 11px;
            opacity: 0.8;
            margin-top: 2px;
          }
          
          .user-rating-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
          }
          
          .user-rating-indicator i {
            color: #4ade80;
            font-size: 16px;
          }
          
          .expand-icon {
            margin-left: auto;
            font-size: 18px;
            transition: transform 0.3s;
          }
          
          .feedback-panel.open ~ .feedback-collapsed .expand-icon {
            transform: rotate(180deg);
          }
          
          /* Expanded Panel - Perfect for Desktop */
          .feedback-panel {
            position: absolute;
            bottom: 90px;
            left: 0;
            width: 420px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.9);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-height: 85vh;
            overflow-y: auto;
          }
          
          .feedback-panel.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
          }
          
          .feedback-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px;
            border-bottom: 2px solid #f0f0f0;
            background: linear-gradient(135deg, #617140 0%, #4a5a30 100%);
            color: white;
            border-radius: 20px 20px 0 0;
          }
          
          .feedback-header h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .feedback-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            font-size: 20px;
            color: white;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .feedback-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
          }
          
          /* Stats Section */
          .stats-section {
            padding: 25px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
          }
          
          .stat-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .stat-box {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          
          .stat-title {
            font-size: 13px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          
          .big-rating {
            font-size: 36px;
            font-weight: bold;
            color: #2d3748;
            line-height: 1;
            margin-bottom: 10px;
          }
          
          .rating-suffix {
            font-size: 20px;
            color: #718096;
            font-weight: normal;
          }
          
          .avg-stars, .your-stars {
            font-size: 20px;
            margin-bottom: 8px;
          }
          
          .avg-stars i {
            color: #ffc107;
            margin: 0 2px;
          }
          
          .your-stars i {
            color: #10b981;
            margin: 0 2px;
          }
          
          .stat-count {
            font-size: 12px;
            color: #718096;
          }
          
          .stat-count a {
            color: #617140;
            text-decoration: none;
            font-weight: 600;
          }
          
          .stat-count a:hover {
            text-decoration: underline;
          }
          
          .overall-stat {
            border: 2px solid #ffc107;
          }
          
          .your-stat {
            border: 2px solid #10b981;
          }
          
          /* User Rating Section */
          .feedback-rate {
            padding: 25px;
            text-align: center;
            background: white;
          }
          
          .feedback-rate p {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #495057;
            font-weight: 500;
          }
          
          .rate-stars {
            font-size: 42px;
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .rate-stars i {
            color: #dee2e6;
            transition: all 0.2s ease;
            cursor: pointer;
            transform-origin: center;
          }
          
          .rate-stars i:hover,
          .rate-stars i.hover {
            color: #ffc107;
            transform: scale(1.2) rotate(-5deg);
            filter: drop-shadow(0 0 10px rgba(255, 193, 7, 0.5));
          }
          
          .rate-stars i.selected {
            color: #ffc107;
            animation: star-pop 0.3s ease;
          }
          
          @keyframes star-pop {
            0% { transform: scale(1); }
            50% { transform: scale(1.3) rotate(10deg); }
            100% { transform: scale(1); }
          }
          
          .rate-message {
            margin: 15px 0 0 0;
            font-size: 15px;
            font-weight: 500;
            min-height: 24px;
            opacity: 0;
            transition: opacity 0.3s;
          }
          
          .rate-message.success {
            color: #10b981;
            opacity: 1;
          }
          
          .rate-message.error {
            color: #ef4444;
            opacity: 1;
          }
          
          /* Feedback Form Section */
          .feedback-form-section {
            padding: 0 25px 25px;
            background: white;
            border-radius: 0 0 20px 20px;
          }
          
          .form-toggle {
            width: 100%;
            padding: 12px 16px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            color: #495057;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.2s;
          }
          
          .form-toggle:hover {
            background: #e9ecef;
          }
          
          .form-toggle i:last-child {
            transition: transform 0.3s;
          }
          
          .form-toggle.active i:last-child {
            transform: rotate(180deg);
          }
          
          .form-content {
            margin-top: 15px;
            animation: slideDown 0.3s ease;
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .widget-feedback-form textarea {
            width: 100%;
            padding: 14px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            font-size: 14px;
            resize: vertical;
            font-family: inherit;
            transition: all 0.2s;
            background: #f8f9fa;
          }
          
          .widget-feedback-form textarea:focus {
            outline: none;
            border-color: #617140;
            background: white;
            box-shadow: 0 0 0 3px rgba(97, 113, 64, 0.1);
          }
          
          .form-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;
          }
          
          .char-count {
            font-size: 12px;
            color: #6c757d;
            font-weight: 500;
          }
          
          .btn-submit {
            background: linear-gradient(135deg, #617140 0%, #4a5a30 100%);
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(97, 113, 64, 0.3);
          }
          
          .btn-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(97, 113, 64, 0.4);
          }
          
          .btn-submit:active:not(:disabled) {
            transform: translateY(0);
          }
          
          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            box-shadow: none;
          }
          
          .form-message {
            margin: 12px 0 0 0;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            min-height: 20px;
            opacity: 0;
            transition: opacity 0.3s;
          }
          
          .form-message.success {
            color: #10b981;
            opacity: 1;
          }
          
          .form-message.error {
            color: #ef4444;
            opacity: 1;
          }
          
          /* Loading spinner */
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .fa-spinner.fa-spin {
            animation: spin 1s linear infinite;
          }
          
          /* Scrollbar styling */
          .feedback-panel::-webkit-scrollbar {
            width: 8px;
          }
          
          .feedback-panel::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 8px;
          }
          
          .feedback-panel::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #617140, #4a5a30);
            border-radius: 8px;
          }
          
          .feedback-panel::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #4a5a30, #3a4a20);
          }
          
          /* ============================================ */
          /* TABLET RESPONSIVE (768px - 1024px) */
          /* ============================================ */
          @media (min-width: 769px) and (max-width: 1024px) {
            .feedback-widget {
              bottom: 15px;
              left: 15px;
            }
            
            .feedback-panel {
              width: 380px;
            }
            
            .toggle-content {
              padding: 12px 18px;
              gap: 15px;
            }
            
            .rating-value-display {
              font-size: 24px;
            }
            
            .big-rating {
              font-size: 32px;
            }
            
            .rate-stars {
              font-size: 38px;
              gap: 8px;
            }
          }
          
          /* ============================================ */
          /* MOBILE RESPONSIVE (max-width: 768px) */
          /* ============================================ */
          @media (max-width: 768px) {
            /* Widget positioning for mobile - higher to avoid footer/chatbot */
            .feedback-widget {
              bottom: 80px; /* Moved up to avoid chatbot */
              left: auto;
              right: 15px;
              width: auto;
            }
            
            /* Collapsed view adjustments - more compact */
            .feedback-collapsed {
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
              max-width: 200px; /* Limit width on mobile */
            }
            
            .toggle-content {
              padding: 8px 12px;
              gap: 10px;
              flex-direction: column; /* Stack vertically */
              align-items: center;
            }
            
            .site-rating-display {
              min-width: auto;
              text-align: center;
            }
            
            .rating-label {
              font-size: 9px;
            }
            
            .rating-value-display {
              font-size: 20px;
              gap: 4px;
            }
            
            .star-display {
              font-size: 16px;
            }
            
            .rating-count {
              font-size: 9px;
            }
            
            .user-rating-indicator {
              padding: 4px 8px;
              font-size: 10px;
              gap: 4px;
              width: 100%;
              justify-content: center;
            }
            
            .user-rating-indicator i {
              font-size: 12px;
            }
            
            .expand-icon {
              font-size: 14px;
              display: none; /* Hide on mobile to save space */
            }
            
            /* Expanded panel mobile optimization - fullscreen modal */
            .feedback-panel {
              position: fixed;
              top: 60px; /* Below header */
              bottom: 0;
              left: 0;
              right: 0;
              width: 100%;
              max-width: none;
              max-height: calc(100vh - 60px);
              border-radius: 0;
              transform: translateY(100%); /* Start off screen */
            }
            
            .feedback-panel.open {
              transform: translateY(0); /* Slide up into view */
            }
            
            .feedback-header {
              padding: 18px;
              border-radius: 16px 16px 0 0;
            }
            
            .feedback-header h3 {
              font-size: 18px;
              gap: 8px;
            }
            
            .feedback-close {
              width: 32px;
              height: 32px;
              font-size: 18px;
            }
            
            /* Stats section mobile */
            .stats-section {
              padding: 15px;
            }
            
            .stat-row {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            
            .stat-box {
              padding: 15px;
              border-radius: 10px;
            }
            
            .stat-title {
              font-size: 12px;
              margin-bottom: 8px;
            }
            
            .big-rating {
              font-size: 28px;
              margin-bottom: 8px;
            }
            
            .rating-suffix {
              font-size: 18px;
            }
            
            .avg-stars, .your-stars {
              font-size: 18px;
              margin-bottom: 6px;
            }
            
            .stat-count {
              font-size: 11px;
            }
            
            /* Rating section mobile */
            .feedback-rate {
              padding: 15px;
            }
            
            .feedback-rate p {
              font-size: 14px;
              margin-bottom: 12px;
            }
            
            .rate-stars {
              font-size: 32px;
              gap: 6px;
              margin-bottom: 12px;
            }
            
            .rate-stars i {
              padding: 2px;
            }
            
            .rate-message {
              font-size: 13px;
              margin-top: 10px;
            }
            
            /* Form section mobile */
            .feedback-form-section {
              padding: 0 15px 15px;
            }
            
            .form-toggle {
              padding: 10px 14px;
              font-size: 13px;
              border-radius: 8px;
            }
            
            .widget-feedback-form textarea {
              padding: 12px;
              font-size: 14px;
              border-radius: 8px;
            }
            
            .form-footer {
              flex-direction: column;
              gap: 10px;
              align-items: stretch;
            }
            
            .char-count {
              text-align: center;
            }
            
            .btn-submit {
              padding: 12px;
              font-size: 14px;
              justify-content: center;
              border-radius: 22px;
            }
            
            .form-message {
              font-size: 13px;
              margin-top: 10px;
            }
          }
          
          /* ============================================ */
          /* SMALL MOBILE (max-width: 380px) */
          /* ============================================ */
          @media (max-width: 380px) {
            /* Even more compact for small phones */
            .feedback-widget {
              bottom: 70px; /* Above chatbot/footer */
              right: 10px;
            }
            
            .feedback-collapsed {
              max-width: 160px;
            }
            
            .toggle-content {
              padding: 6px 10px;
              gap: 6px;
            }
            
            .rating-value-display {
              font-size: 18px;
            }
            
            .user-rating-indicator {
              font-size: 9px;
              padding: 3px 6px;
            }
            
            .feedback-header {
              padding: 15px;
              position: sticky;
              top: 0;
              z-index: 10;
            }
            
            .feedback-header h3 {
              font-size: 16px;
            }
            
            .big-rating {
              font-size: 24px;
            }
            
            .rate-stars {
              font-size: 28px;
              gap: 4px;
            }
            
            .widget-feedback-form textarea {
              padding: 10px;
              font-size: 13px;
            }
            
            .btn-submit {
              padding: 10px;
              font-size: 13px;
            }
          }
          
          /* ============================================ */
          /* LANDSCAPE MOBILE (orientation: landscape) */
          /* ============================================ */
          @media (max-width: 768px) and (orientation: landscape) {
            .feedback-widget {
              bottom: 10px; /* Lower in landscape */
              right: 10px;
            }
            
            .feedback-panel {
              max-height: 100vh;
              top: 0;
            }
            
            .stats-section {
              padding: 10px;
            }
            
            .stat-row {
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            
            .stat-box {
              padding: 10px;
            }
            
            .big-rating {
              font-size: 24px;
            }
            
            .feedback-rate {
              padding: 10px;
            }
            
            .rate-stars {
              font-size: 28px;
            }
          }
        </style>
      `;
      document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    // Add HTML to body
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
  }

  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
    
    // Toggle button (collapsed view)
    const toggleBtn = document.getElementById('feedback-toggle');
    toggleBtn?.addEventListener('click', () => this.togglePanel());
    
    // Close button
    const closeBtn = document.getElementById('feedback-close');
    closeBtn?.addEventListener('click', () => this.closePanel());
    
    // Change rating link
    const changeRatingLink = document.getElementById('change-rating-link');
    changeRatingLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showRatingSection();
    });
    
    // Rating stars
    const stars = document.querySelectorAll('#widget-rate-stars i');
    stars.forEach(star => {
      star.addEventListener('click', (e) => this.handleRating(e));
      star.addEventListener('mouseenter', (e) => this.handleHover(e));
    });
    
    const starsContainer = document.getElementById('widget-rate-stars');
    starsContainer?.addEventListener('mouseleave', () => this.handleHoverOut());
    
    // Form toggle
    const formToggle = document.getElementById('form-toggle');
    formToggle?.addEventListener('click', () => this.toggleForm());
    
    // Feedback form
    const form = document.getElementById('widget-feedback-form');
    form?.addEventListener('submit', (e) => this.handleFeedbackSubmit(e));
    
    // Character counter
    const textarea = document.getElementById('widget-feedback-text');
    textarea?.addEventListener('input', (e) => {
      const count = e.target.value.length;
      document.getElementById('widget-char-count').textContent = count;
    });
    
    // Click outside to close (only on desktop)
    document.addEventListener('click', (e) => {
      if (!this.isMobile) {
        const widget = document.getElementById('feedback-widget');
        if (!widget?.contains(e.target) && this.isOpen) {
          this.closePanel();
        }
      }
    });
    
    // Set up continuous auth monitoring
    import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js').then(({ onAuthStateChanged }) => {
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this.onAuthChange(user);
        this.updateAdminNavigation();
      });
    }).catch(console.error);
  }

  // ... Rest of the methods remain the same ...
  togglePanel() {
    this.isOpen ? this.closePanel() : this.openPanel();
  }

  openPanel() {
    const panel = document.getElementById('feedback-panel');
    if (panel) {
      panel.classList.add('open');
      this.isOpen = true;
      this.trackEvent('panel_opened');
    }
  }

  closePanel() {
    const panel = document.getElementById('feedback-panel');
    if (panel) {
      panel.classList.remove('open');
      this.isOpen = false;
      this.trackEvent('panel_closed');
    }
  }

  toggleForm() {
    const formToggle = document.getElementById('form-toggle');
    const formContent = document.getElementById('form-content');
    
    if (formContent.style.display === 'none') {
      formContent.style.display = 'block';
      formToggle.classList.add('active');
    } else {
      formContent.style.display = 'none';
      formToggle.classList.remove('active');
    }
  }

  showRatingSection() {
    const ratingSection = document.querySelector('.feedback-rate');
    if (ratingSection) {
      ratingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  handleHover(e) {
    const rating = parseInt(e.target.dataset.rating);
    const stars = document.querySelectorAll('#widget-rate-stars i');
    
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('hover');
      } else {
        star.classList.remove('hover');
      }
    });
  }

  handleHoverOut() {
    const stars = document.querySelectorAll('#widget-rate-stars i');
    stars.forEach(star => star.classList.remove('hover'));
    this.updateRatingDisplay();
  }

  async handleRating(e) {
    const rating = parseInt(e.target.dataset.rating);
    console.log('⭐ Rating clicked:', rating);
    
    // Check if user is signed in
    if (!this.currentUser) {
      console.log('❌ No user found, asking to sign in');
      this.showMessage('widget-rate-message', 'Please sign in to rate', 'error');
      
      // Open sign-in modal if available
      if (window.openAuthModal) {
        window.openAuthModal();
      }
      return;
    }
    
    this.currentRating = rating;
    this.updateRatingDisplay();
    
    try {
      // Import Firestore functions
      const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      console.log('💾 Saving rating to Firestore...');
      
      // Save rating using best practice flat collection structure
      await setDoc(doc(this.db, 'feedback_ratings', this.currentUser.uid), {
        rating: rating,
        email: this.currentUser.email,
        displayName: this.currentUser.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
        photoURL: this.currentUser.photoURL || null,
        uid: this.currentUser.uid
      });
      
      console.log('✅ Rating saved successfully');
      
      this.hasRated = true;
      this.showMessage('widget-rate-message', `You rated ${rating} stars! Thank you!`, 'success');
      
      // Update user rating display
      this.updateUserRatingDisplay(rating);
      
      // Update aggregate stats
      await this.updateStats();
      
      // Track rating event
      this.trackEvent('rating_submitted', { rating });
      
    } catch (error) {
      console.error('❌ Rating error:', error);
      console.error('Error details:', error.code, error.message);
      this.showMessage('widget-rate-message', 'Error saving rating. Please try again.', 'error');
    }
  }

  updateRatingDisplay() {
    const stars = document.querySelectorAll('#widget-rate-stars i');
    stars.forEach((star, index) => {
      if (index < this.currentRating) {
        star.classList.remove('far');
        star.classList.add('fas', 'selected');
      } else {
        star.classList.remove('fas', 'selected');
        star.classList.add('far');
      }
    });
  }

  updateUserRatingDisplay(rating) {
    // Show user rating section
    const yourRatingDisplay = document.getElementById('your-rating-display');
    if (yourRatingDisplay) {
      yourRatingDisplay.style.display = 'block';
    }
    
    // Update rating value
    const yourRatingValue = document.getElementById('widget-your-rating');
    if (yourRatingValue) {
      yourRatingValue.textContent = rating;
    }
    
    // Update stars
    const yourStars = document.getElementById('widget-your-stars');
    if (yourStars) {
      yourStars.innerHTML = '';
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = i <= rating ? 'fas fa-star' : 'far fa-star';
        yourStars.appendChild(star);
      }
    }
    
    // Update collapsed view indicator
    const userIndicator = document.getElementById('user-rated-indicator');
    const collapsedUserRating = document.getElementById('collapsed-user-rating');
    if (userIndicator) {
      userIndicator.style.display = 'flex';
      if (collapsedUserRating) {
        collapsedUserRating.textContent = rating;
      }
    }
    
    // Hide rating section, show change link
    document.getElementById('rate-prompt').textContent = 'Want to change your rating?';
  }

  async subscribeToRatings() {
    if (!this.db) return;
    
    try {
      const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      // Subscribe to stats updates using best practice flat collection
      this.statsUnsubscribe = onSnapshot(
        doc(this.db, 'feedback_stats', 'aggregate'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            this.overallRating = data.averageRating || 0;
            this.totalRatings = data.totalRatings || 0;
            this.updateAverageDisplay(this.overallRating, this.totalRatings);
          } else {
            // Create initial stats doc if it doesn't exist
            this.updateStats();
          }
        },
        (error) => {
          console.error('Error subscribing to stats:', error);
        }
      );
    } catch (error) {
      console.error('Error setting up subscription:', error);
    }
  }

  updateAverageDisplay(average, count) {
    this.overallRating = average;
    this.totalRatings = count;
    
    // Update expanded view
    const avgElement = document.getElementById('widget-avg-rating');
    const countElement = document.getElementById('widget-rating-count');
    
    if (avgElement) avgElement.textContent = average.toFixed(1);
    if (countElement) countElement.textContent = count;
    
    // Update collapsed view
    const collapsedRating = document.getElementById('collapsed-rating');
    const collapsedCount = document.getElementById('collapsed-count');
    
    if (collapsedRating) collapsedRating.textContent = average.toFixed(1);
    if (collapsedCount) collapsedCount.textContent = `${count} rating${count !== 1 ? 's' : ''}`;
    
    // Update stars with better visual
    const stars = document.querySelectorAll('#widget-avg-stars i');
    const fullStars = Math.floor(average);
    const hasHalfStar = (average % 1) >= 0.5;
    
    stars.forEach((star, index) => {
      star.classList.remove('far', 'fas', 'fa-star-half-alt');
      
      if (index < fullStars) {
        star.classList.add('fas', 'fa-star');
      } else if (index === fullStars && hasHalfStar) {
        star.classList.add('fas', 'fa-star-half-alt');
      } else {
        star.classList.add('far', 'fa-star');
      }
    });
  }

  async handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const textarea = document.getElementById('widget-feedback-text');
    const submitBtn = e.target.querySelector('.btn-submit');
    const feedback = textarea.value.trim();
    
    if (!feedback) {
      this.showMessage('widget-form-message', 'Please enter feedback', 'error');
      return;
    }
    
    // Disable button and show loading
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      console.log('📝 Submitting feedback...');
      
      // Submit feedback using best practice flat collection
      const feedbackData = {
        text: feedback,
        rating: this.currentRating || null,
        email: this.currentUser?.email || 'anonymous',
        displayName: this.currentUser?.displayName || 'Anonymous',
        uid: this.currentUser?.uid || null,
        timestamp: serverTimestamp(),
        anonymous: !this.currentUser,
        userAgent: navigator.userAgent,
        page: window.location.pathname,
        referrer: document.referrer || 'direct'
      };
      
      await addDoc(collection(this.db, 'feedback_comments'), feedbackData);
      
      console.log('✅ Feedback submitted');
      
      // Clear form
      textarea.value = '';
      document.getElementById('widget-char-count').textContent = '0';
      
      this.showMessage('widget-form-message', 'Thank you for your feedback!', 'success');
      
      // Track feedback event
      this.trackEvent('feedback_submitted', { hasRating: !!this.currentRating });
      
      // Close form after 2 seconds
      setTimeout(() => {
        this.toggleForm();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Feedback error:', error);
      this.showMessage('widget-form-message', 'Error submitting feedback. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalContent;
      submitBtn.disabled = false;
    }
  }

  async checkUserRating() {
    if (!this.currentUser || !this.db) return;
    
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      console.log('🔍 Checking existing rating for:', this.currentUser.email);
      
      // Check user's rating using best practice flat collection
      const ratingDoc = await getDoc(doc(this.db, 'feedback_ratings', this.currentUser.uid));
      
      if (ratingDoc.exists()) {
        const data = ratingDoc.data();
        this.currentRating = data.rating;
        this.hasRated = true;
        this.updateRatingDisplay();
        this.updateUserRatingDisplay(this.currentRating);
        console.log('✅ Found existing rating:', this.currentRating);
      } else {
        console.log('📝 No existing rating found');
      }
    } catch (error) {
      console.error('Error checking user rating:', error);
    }
  }

  async updateStats() {
    if (!this.db) return;
    
    try {
      const { collection, getDocs, doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      console.log('📊 Updating stats...');
      
      // Get all ratings using best practice flat collection
      const ratingsSnapshot = await getDocs(collection(this.db, 'feedback_ratings'));
      
      let total = 0;
      let count = 0;
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      ratingsSnapshot.forEach((docSnap) => {
        const rating = docSnap.data().rating;
        if (rating >= 1 && rating <= 5) {
          total += rating;
          count++;
          distribution[rating]++;
        }
      });
      
      const average = count > 0 ? total / count : 0;
      
      console.log(`📈 Stats: ${count} ratings, average: ${average.toFixed(2)}`);
      
      // Update stats document using best practice flat collection
      await setDoc(doc(this.db, 'feedback_stats', 'aggregate'), {
        averageRating: average,
        totalRatings: count,
        totalSum: total,
        distribution: distribution,
        lastUpdated: serverTimestamp(),
        updatedBy: this.currentUser?.email || 'system'
      });
      
      console.log('✅ Stats updated successfully');
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.className = element.className.split(' ')[0] + ' ' + type;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      element.textContent = '';
      element.className = element.className.split(' ')[0];
    }, 5000);
  }

  onAuthChange(user) {
    console.log('🔄 Auth state changed in widget:', user?.email || 'signed out');
    
    const prompt = document.getElementById('rate-prompt');
    if (prompt) {
      if (user) {
        prompt.textContent = 'Your rating:';
        if (this.initialized) {
          this.checkUserRating();
        }
      } else {
        prompt.textContent = 'Sign in to rate:';
        this.currentRating = 0;
        this.hasRated = false;
        this.updateRatingDisplay();
        
        // Hide user rating display
        const yourRatingDisplay = document.getElementById('your-rating-display');
        if (yourRatingDisplay) {
          yourRatingDisplay.style.display = 'none';
        }
        
        // Hide user indicator in collapsed view
        const userIndicator = document.getElementById('user-rated-indicator');
        if (userIndicator) {
          userIndicator.style.display = 'none';
        }
      }
    }
  }

  // Analytics tracking (optional - can connect to Google Analytics)
  trackEvent(eventName, eventData = {}) {
    console.log(`📊 Event: ${eventName}`, eventData);
    
    // If Google Analytics is available, track the event
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Feedback Widget',
        ...eventData
      });
    }
  }

  // Cleanup method for when the widget is removed
  destroy() {
    console.log('🧹 Cleaning up feedback widget...');
    
    // Unsubscribe from Firestore listeners
    if (this.statsUnsubscribe) {
      this.statsUnsubscribe();
    }
    
    // Remove DOM elements
    const widget = document.getElementById('feedback-widget');
    if (widget) {
      widget.remove();
    }
    
    // Remove styles
    const styles = document.getElementById('feedback-widget-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Initialize widget when DOM is ready
console.log('📋 Responsive Feedback Widget: Script loaded, waiting for DOM...');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM ready, initializing Responsive Feedback Widget...');
    window.feedbackWidget = new FeedbackWidget();
  });
} else {
  console.log('🚀 DOM already ready, initializing Responsive Feedback Widget...');
  window.feedbackWidget = new FeedbackWidget();
}