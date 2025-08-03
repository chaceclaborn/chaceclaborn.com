// js/feedback-widget.js - Modular Feedback Widget with Enhanced Visibility
// Drop this into any page for instant feedback functionality

class FeedbackWidget {
  constructor() {
    console.log('🎯 Initializing Feedback Widget...');
    this.isOpen = false;
    this.currentRating = 0;
    this.hasRated = false;
    this.auth = null;
    this.db = null;
    this.initialized = false;
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
      
      // Subscribe to rating updates
      this.subscribeToRatings();
      
      // Check if user already rated
      this.checkUserRating();
      
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
    
    // Try multiple methods to get Firebase
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max
    
    while (attempts < maxAttempts) {
      // Check if Firebase is available through imports
      try {
        const { auth, db } = await import('./firebase/config.js');
        if (auth && db) {
          this.auth = auth;
          this.db = db;
          
          const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js');
          
          // Watch auth state
          onAuthStateChanged(auth, (user) => {
            console.log('👤 Feedback Widget: Auth state changed:', user ? user.email : 'signed out');
            this.onAuthChange(user);
          });
          
          return;
        }
      } catch (error) {
        // Try again
      }
      
      // Also check window.firebase (older method)
      if (window.firebase && window.firebase.auth && window.firebase.firestore) {
        this.auth = window.firebase.auth();
        this.db = window.firebase.firestore();
        return;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.warn('⚠️ Feedback Widget: Firebase not found, running in demo mode');
  }

  createWidget() {
    // Remove any existing widget first
    const existingWidget = document.getElementById('feedback-widget');
    if (existingWidget) {
      existingWidget.remove();
    }
    
    // Create widget container
    const widgetHTML = `
      <!-- Feedback Widget -->
      <div id="feedback-widget" class="feedback-widget" style="opacity: 0;">
        <!-- Toggle Button -->
        <button id="feedback-toggle" class="feedback-toggle" aria-label="Give Feedback" title="Rate this portfolio">
          <i class="fas fa-comment-dots"></i>
          <span class="feedback-badge" id="rating-badge" style="display: none;">0.0</span>
        </button>
        
        <!-- Feedback Panel -->
        <div id="feedback-panel" class="feedback-panel">
          <!-- Header -->
          <div class="feedback-header">
            <h3><i class="fas fa-star"></i> Rate This Portfolio</h3>
            <button id="feedback-close" class="feedback-close" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- Average Rating -->
          <div class="feedback-avg">
            <div class="avg-number">
              <span id="widget-avg-rating">0.0</span>
              <span class="avg-max">/5</span>
            </div>
            <div class="avg-stars" id="widget-avg-stars">
              <i class="far fa-star"></i>
              <i class="far fa-star"></i>
              <i class="far fa-star"></i>
              <i class="far fa-star"></i>
              <i class="far fa-star"></i>
            </div>
            <div class="avg-count">
              Based on <span id="widget-rating-count">0</span> ratings
            </div>
          </div>
          
          <!-- User Rating -->
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
          
          <!-- Feedback Form -->
          <div class="feedback-form-section">
            <h4><i class="fas fa-envelope"></i> Leave Feedback</h4>
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
    `;
    
    // Add styles if not already present
    if (!document.getElementById('feedback-widget-styles')) {
      const styles = `
        <style id="feedback-widget-styles">
          /* Feedback Widget Styles - High Z-Index for Visibility */
          .feedback-widget {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 10000 !important; /* Very high z-index */
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            transition: opacity 0.5s ease;
          }
          
          /* Ensure widget is above everything */
          .feedback-widget * {
            z-index: 10001 !important;
          }
          
          /* Toggle Button */
          .feedback-toggle {
            position: relative;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #617140 0%, #4a5a30 100%);
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002 !important;
          }
          
          /* Pulse animation to draw attention */
          @keyframes pulse {
            0% {
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            50% {
              box-shadow: 0 4px 30px rgba(97, 113, 64, 0.6);
            }
            100% {
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
          }
          
          .feedback-toggle {
            animation: pulse 2s infinite;
          }
          
          .feedback-toggle:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
            animation: none;
          }
          
          .feedback-toggle:active {
            transform: scale(0.95);
          }
          
          .feedback-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ffc107;
            color: #333;
            font-size: 12px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          }
          
          /* Feedback Panel */
          .feedback-panel {
            position: absolute;
            bottom: 80px;
            left: 0;
            width: 320px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.9);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            z-index: 10003 !important;
            max-height: 80vh;
            overflow-y: auto;
          }
          
          .feedback-panel.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
          }
          
          /* Panel Header */
          .feedback-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
            background: #f8f9fa;
            border-radius: 16px 16px 0 0;
            position: sticky;
            top: 0;
            z-index: 10004;
          }
          
          .feedback-header h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .feedback-header h3 i {
            color: #ffc107;
          }
          
          .feedback-close {
            width: 32px;
            height: 32px;
            border: none;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            color: #666;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .feedback-close:hover {
            background: #f44336;
            color: white;
            transform: rotate(90deg);
          }
          
          /* Average Rating Section */
          .feedback-avg {
            padding: 20px;
            text-align: center;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .avg-number {
            font-size: 36px;
            font-weight: bold;
            color: #617140;
            margin-bottom: 10px;
          }
          
          .avg-max {
            font-size: 20px;
            color: #999;
          }
          
          .avg-stars {
            display: flex;
            justify-content: center;
            gap: 5px;
            font-size: 20px;
            margin-bottom: 8px;
          }
          
          .avg-stars i {
            color: #ddd;
            transition: color 0.3s;
          }
          
          .avg-stars i.filled {
            color: #ffc107;
            animation: starPop 0.3s ease;
          }
          
          @keyframes starPop {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }
          
          .avg-count {
            font-size: 13px;
            color: #666;
          }
          
          /* User Rating Section */
          .feedback-rate {
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
            background: white;
          }
          
          #rate-prompt {
            margin: 0 0 15px 0;
            color: #666;
            font-size: 14px;
          }
          
          .rate-stars {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .rate-stars i {
            font-size: 28px;
            color: #ddd;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .rate-stars i:hover {
            color: #ffc107;
            transform: scale(1.2);
          }
          
          .rate-stars i.selected {
            color: #ffc107;
            animation: starSelect 0.4s ease;
          }
          
          @keyframes starSelect {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.4) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          
          .rate-message {
            font-size: 13px;
            font-weight: 500;
            min-height: 20px;
            margin: 0;
          }
          
          .rate-message.success {
            color: #4CAF50;
          }
          
          .rate-message.error {
            color: #f44336;
          }
          
          /* Feedback Form Section */
          .feedback-form-section {
            padding: 20px;
            background: white;
            border-radius: 0 0 16px 16px;
          }
          
          .feedback-form-section h4 {
            margin: 0 0 15px 0;
            font-size: 14px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .feedback-form-section h4 i {
            color: #617140;
          }
          
          .widget-feedback-form {
            margin: 0;
          }
          
          #widget-feedback-text {
            width: 100%;
            padding: 10px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            resize: none;
            font-family: inherit;
            transition: all 0.2s;
            background: #f8f9fa;
          }
          
          #widget-feedback-text:focus {
            outline: none;
            border-color: #617140;
            box-shadow: 0 0 0 3px rgba(97, 113, 64, 0.1);
            background: white;
          }
          
          .form-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
          }
          
          .char-count {
            font-size: 12px;
            color: #999;
          }
          
          .btn-submit {
            padding: 8px 20px;
            background: linear-gradient(135deg, #617140 0%, #4a5a30 100%);
            color: white;
            border: none;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(97, 113, 64, 0.4);
          }
          
          .btn-submit:active {
            transform: translateY(0);
          }
          
          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .form-message {
            margin: 10px 0 0 0;
            font-size: 13px;
            font-weight: 500;
            text-align: center;
          }
          
          .form-message.success {
            color: #4CAF50;
          }
          
          .form-message.error {
            color: #f44336;
          }
          
          /* Loading state */
          .feedback-loading {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #617140;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 8px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Mobile Responsive */
          @media (max-width: 380px) {
            .feedback-widget {
              left: 10px;
              bottom: 10px;
            }
            
            .feedback-panel {
              width: calc(100vw - 20px);
              left: 50%;
              transform: translateX(-50%) translateY(20px) scale(0.9);
            }
            
            .feedback-panel.active {
              transform: translateX(-50%) translateY(0) scale(1);
            }
          }
          
          /* Dark overlay when panel is open */
          .feedback-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }
          
          .feedback-overlay.active {
            opacity: 1;
            visibility: visible;
          }
        </style>
      `;
      document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    // Add overlay div
    const overlayHTML = '<div id="feedback-overlay" class="feedback-overlay"></div>';
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
    
    // Add widget HTML to body
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    
    // Log successful creation
    const widget = document.getElementById('feedback-widget');
    if (widget) {
      console.log('✅ Feedback widget element created and added to DOM');
      console.log('📍 Widget location:', {
        bottom: '20px',
        left: '20px',
        zIndex: window.getComputedStyle(widget).zIndex
      });
    } else {
      console.error('❌ Failed to create feedback widget element');
    }
  }

  setupEventListeners() {
    // Toggle button
    const toggleBtn = document.getElementById('feedback-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        console.log('🔘 Toggle button clicked');
        this.togglePanel();
      });
    }
    
    // Close button
    const closeBtn = document.getElementById('feedback-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closePanel();
      });
    }
    
    // Overlay click to close
    const overlay = document.getElementById('feedback-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        this.closePanel();
      });
    }
    
    // Rating stars
    const stars = document.querySelectorAll('.rate-stars i');
    stars.forEach(star => {
      star.addEventListener('click', (e) => this.handleRating(e));
      star.addEventListener('mouseenter', (e) => this.handleStarHover(e));
    });
    
    document.querySelector('.rate-stars').addEventListener('mouseleave', () => {
      this.updateRatingDisplay();
    });
    
    // Feedback form
    const form = document.getElementById('widget-feedback-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        this.handleFeedbackSubmit(e);
      });
    }
    
    // Character count
    const textarea = document.getElementById('widget-feedback-text');
    const charCount = document.getElementById('widget-char-count');
    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
      });
    }
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('feedback-panel');
    const toggle = document.getElementById('feedback-toggle');
    const overlay = document.getElementById('feedback-overlay');
    
    if (this.isOpen) {
      panel.classList.add('active');
      overlay.classList.add('active');
      toggle.innerHTML = '<i class="fas fa-times"></i>';
      toggle.style.animation = 'none';
      console.log('📂 Feedback panel opened');
    } else {
      panel.classList.remove('active');
      overlay.classList.remove('active');
      toggle.innerHTML = `
        <i class="fas fa-comment-dots"></i>
        ${this.hasRated ? `<span class="feedback-badge" id="rating-badge">${(this.currentAverage || 0).toFixed(1)}</span>` : ''}
      `;
      toggle.style.animation = 'pulse 2s infinite';
      console.log('📁 Feedback panel closed');
    }
  }

  closePanel() {
    this.isOpen = false;
    const panel = document.getElementById('feedback-panel');
    const toggle = document.getElementById('feedback-toggle');
    const overlay = document.getElementById('feedback-overlay');
    
    panel.classList.remove('active');
    overlay.classList.remove('active');
    toggle.innerHTML = `
      <i class="fas fa-comment-dots"></i>
      ${this.hasRated ? `<span class="feedback-badge" id="rating-badge">${(this.currentAverage || 0).toFixed(1)}</span>` : ''}
    `;
    toggle.style.animation = 'pulse 2s infinite';
  }

  async subscribeToRatings() {
    if (!this.db) {
      console.warn('⚠️ No database connection for ratings subscription');
      return;
    }
    
    try {
      const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      const statsRef = doc(this.db, 'feedback/stats/aggregate');
      
      onSnapshot(statsRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          this.updateAverageDisplay(data.averageRating || 0, data.totalRatings || 0);
        }
      });
    } catch (error) {
      console.error('Error subscribing to ratings:', error);
    }
  }

  updateAverageDisplay(average, count) {
    this.currentAverage = average;
    
    // Update average number
    const avgRating = document.getElementById('widget-avg-rating');
    const ratingCount = document.getElementById('widget-rating-count');
    
    if (avgRating) avgRating.textContent = average.toFixed(1);
    if (ratingCount) ratingCount.textContent = count;
    
    // Update average stars
    const stars = document.querySelectorAll('#widget-avg-stars i');
    stars.forEach((star, index) => {
      if (index < Math.round(average)) {
        star.classList.add('filled', 'fas');
        star.classList.remove('far');
      } else {
        star.classList.remove('filled');
        star.classList.add('far');
        star.classList.remove('fas');
      }
    });
    
    // Update badge if rated
    if (this.hasRated && !this.isOpen) {
      const badge = document.getElementById('rating-badge');
      if (badge) {
        badge.textContent = average.toFixed(1);
        badge.style.display = 'block';
      }
    }
  }

  async handleRating(e) {
    const rating = parseInt(e.target.dataset.rating);
    console.log('⭐ Rating clicked:', rating);
    
    if (!this.auth || !this.auth.currentUser) {
      this.showMessage('widget-rate-message', 'Please sign in to rate', 'error');
      return;
    }
    
    try {
      const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      await setDoc(doc(this.db, 'feedback/ratings', this.auth.currentUser.uid), {
        rating: rating,
        userId: this.auth.currentUser.uid,
        userEmail: this.auth.currentUser.email,
        timestamp: serverTimestamp()
      });
      
      this.currentRating = rating;
      this.hasRated = true;
      this.updateRatingDisplay();
      this.showMessage('widget-rate-message', 'Thanks for rating!', 'success');
      
      // Update stats
      await this.updateStats();
      
    } catch (error) {
      console.error('Rating error:', error);
      this.showMessage('widget-rate-message', 'Error submitting rating', 'error');
    }
  }

  handleStarHover(e) {
    const hoverRating = parseInt(e.target.dataset.rating);
    const stars = document.querySelectorAll('.rate-stars i');
    
    stars.forEach(star => {
      const starRating = parseInt(star.dataset.rating);
      if (starRating <= hoverRating) {
        star.classList.add('fas');
        star.classList.remove('far');
      } else {
        star.classList.add('far');
        star.classList.remove('fas');
      }
    });
  }

  updateRatingDisplay() {
    const stars = document.querySelectorAll('.rate-stars i');
    stars.forEach(star => {
      const starRating = parseInt(star.dataset.rating);
      if (this.currentRating && starRating <= this.currentRating) {
        star.classList.add('selected', 'fas');
        star.classList.remove('far');
      } else {
        star.classList.remove('selected');
        star.classList.add('far');
        star.classList.remove('fas');
      }
    });
  }

  async handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const text = document.getElementById('widget-feedback-text').value.trim();
    if (!text) return;
    
    console.log('📝 Submitting feedback...');
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="feedback-loading"></span>';
    submitBtn.disabled = true;
    
    try {
      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      await addDoc(collection(this.db, 'feedback/comments'), {
        text: text,
        email: this.auth?.currentUser?.email || 'anonymous',
        timestamp: serverTimestamp(),
        userId: this.auth?.currentUser?.uid || null,
        userAgent: navigator.userAgent,
        authenticated: !!this.auth?.currentUser
      });
      
      // Clear form
      document.getElementById('widget-feedback-text').value = '';
      document.getElementById('widget-char-count').textContent = '0';
      
      this.showMessage('widget-form-message', 'Thank you for your feedback!', 'success');
      
      // Close panel after 2 seconds
      setTimeout(() => {
        this.closePanel();
      }, 2000);
      
    } catch (error) {
      console.error('Feedback error:', error);
      this.showMessage('widget-form-message', 'Error submitting feedback', 'error');
    } finally {
      submitBtn.innerHTML = originalContent;
      submitBtn.disabled = false;
    }
  }

  async checkUserRating() {
    if (!this.auth || !this.auth.currentUser || !this.db) return;
    
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      const ratingDoc = await getDoc(doc(this.db, 'feedback/ratings', this.auth.currentUser.uid));
      
      if (ratingDoc.exists()) {
        this.currentRating = ratingDoc.data().rating;
        this.hasRated = true;
        this.updateRatingDisplay();
        this.showMessage('widget-rate-message', `You rated ${this.currentRating} stars`, 'success');
      }
    } catch (error) {
      console.error('Error checking user rating:', error);
    }
  }

  async updateStats() {
    if (!this.db) return;
    
    try {
      const { collection, getDocs, doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      const ratingsSnapshot = await getDocs(collection(this.db, 'feedback/ratings'));
      
      let total = 0;
      let count = 0;
      
      ratingsSnapshot.forEach((doc) => {
        const rating = doc.data().rating;
        if (rating >= 1 && rating <= 5) {
          total += rating;
          count++;
        }
      });
      
      const average = count > 0 ? total / count : 0;
      
      await setDoc(doc(this.db, 'feedback/stats/aggregate'), {
        averageRating: average,
        totalRatings: count,
        lastUpdated: serverTimestamp()
      });
      
      console.log('📊 Stats updated:', { average, count });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.className = element.className.split(' ')[0] + ' ' + type;
    
    setTimeout(() => {
      element.textContent = '';
      element.className = element.className.split(' ')[0];
    }, 3000);
  }

  onAuthChange(user) {
    const prompt = document.getElementById('rate-prompt');
    if (prompt) {
      if (user) {
        prompt.textContent = 'Click to rate:';
        this.checkUserRating();
      } else {
        prompt.textContent = 'Sign in to rate:';
        this.currentRating = 0;
        this.hasRated = false;
        this.updateRatingDisplay();
      }
    }
  }
}

// Initialize widget when DOM is ready
console.log('📋 Feedback Widget: Script loaded, waiting for DOM...');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM ready, initializing Feedback Widget...');
    window.feedbackWidget = new FeedbackWidget();
  });
} else {
  console.log('🚀 DOM already ready, initializing Feedback Widget...');
  window.feedbackWidget = new FeedbackWidget();
}