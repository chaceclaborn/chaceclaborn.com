// js/firebase/feedback-service.js - Fixed with Correct Firestore Paths
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
        const { auth, db } = await import('./config.js');
        if (auth && db) {
          this.auth = auth;
          this.db = db;
          
          const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js');
          
          // Watch auth state
          onAuthStateChanged(auth, (user) => {
            console.log('👤 Feedback Widget: Auth state changed:', user ? user.email : 'Signed out');
            this.currentUser = user;
            this.checkUserRating();
          });
          
          console.log('✅ Firebase loaded successfully');
          return;
        }
      } catch (e) {
        // Firebase not ready yet
      }
      
      // Check global window object
      if (window.auth && window.db) {
        this.auth = window.auth;
        this.db = window.db;
        console.log('✅ Firebase found in window');
        return;
      }
      
      // Wait 100ms before next attempt
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    throw new Error('Firebase failed to load after 5 seconds');
  }

  createWidget() {
    const widgetHTML = `
      <div id="feedback-widget" style="opacity: 0; transition: opacity 0.5s;">
        <!-- Floating Button -->
        <button id="feedback-btn" class="feedback-float-btn" aria-label="Feedback">
          <span class="feedback-icon">💬</span>
          <span class="feedback-label">Feedback</span>
        </button>

        <!-- Feedback Panel -->
        <div id="feedback-panel" class="feedback-panel">
          <div class="feedback-header">
            <h3>We'd Love Your Feedback!</h3>
            <button id="close-feedback" class="feedback-close" aria-label="Close">×</button>
          </div>

          <!-- Rating Section -->
          <div class="feedback-rate">
            <p id="rate-prompt">How would you rate your experience?</p>
            <div id="widget-rate-stars" class="rate-stars">
              <i class="far fa-star" data-rating="1"></i>
              <i class="far fa-star" data-rating="2"></i>
              <i class="far fa-star" data-rating="3"></i>
              <i class="far fa-star" data-rating="4"></i>
              <i class="far fa-star" data-rating="5"></i>
            </div>
            <div id="widget-rate-message" class="feedback-message"></div>
          </div>

          <!-- Average Rating Display -->
          <div class="feedback-stats">
            <div class="avg-rating">
              <span id="widget-avg-rating">0.0</span>
              <div id="widget-avg-stars" class="avg-stars">
                <i class="far fa-star"></i>
                <i class="far fa-star"></i>
                <i class="far fa-star"></i>
                <i class="far fa-star"></i>
                <i class="far fa-star"></i>
              </div>
              <span id="widget-rating-count">(0 ratings)</span>
            </div>
          </div>

          <!-- Text Feedback Section -->
          <div class="feedback-form">
            <form id="widget-feedback-form">
              <label for="widget-feedback-text">Share your thoughts (optional):</label>
              <textarea 
                id="widget-feedback-text" 
                rows="4" 
                maxlength="500"
                placeholder="Tell us what you think..."
              ></textarea>
              <div class="form-footer">
                <span id="widget-char-count">0</span>/500
                <button type="submit" class="btn-submit">Send Feedback</button>
              </div>
              <div id="widget-form-message" class="feedback-message"></div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Add CSS styles
    const styles = `
      <style>
        #feedback-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .feedback-float-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 15px 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .feedback-float-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .feedback-icon {
          font-size: 20px;
        }

        .feedback-panel {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          max-width: 90vw;
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s ease;
        }

        .feedback-panel.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .feedback-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .feedback-header h3 {
          margin: 0;
          font-size: 18px;
          color: #1f2937;
        }

        .feedback-close {
          background: none;
          border: none;
          font-size: 28px;
          color: #6b7280;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 30px;
          height: 30px;
        }

        .feedback-rate {
          padding: 20px;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .feedback-rate p {
          margin: 0 0 15px 0;
          color: #4b5563;
        }

        .rate-stars {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .rate-stars i {
          font-size: 28px;
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rate-stars i:hover,
        .rate-stars i.hover {
          color: #fbbf24;
          transform: scale(1.2);
        }

        .rate-stars i.selected {
          color: #fbbf24;
        }

        .feedback-stats {
          padding: 15px 20px;
          background: #f9fafb;
          text-align: center;
        }

        .avg-rating {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #6b7280;
          font-size: 14px;
        }

        #widget-avg-rating {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
        }

        .avg-stars {
          display: flex;
          gap: 2px;
        }

        .avg-stars i {
          font-size: 14px;
          color: #fbbf24;
        }

        .feedback-form {
          padding: 20px;
        }

        .feedback-form label {
          display: block;
          margin-bottom: 10px;
          color: #4b5563;
          font-size: 14px;
        }

        .feedback-form textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          resize: vertical;
          font-family: inherit;
          font-size: 14px;
          box-sizing: border-box;
        }

        .feedback-form textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }

        #widget-char-count {
          color: #9ca3af;
          font-size: 12px;
        }

        .btn-submit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .feedback-message {
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          display: none;
        }

        .feedback-message.success {
          background: #d1fae5;
          color: #065f46;
          display: block;
        }

        .feedback-message.error {
          background: #fee2e2;
          color: #991b1b;
          display: block;
        }

        .feedback-loading {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .feedback-panel {
            width: calc(100vw - 20px);
            right: 10px;
            left: 10px;
          }
        }
      </style>
    `;

    // Add to page
    document.head.insertAdjacentHTML('beforeend', styles);
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
  }

  setupEventListeners() {
    // Toggle panel
    document.getElementById('feedback-btn')?.addEventListener('click', () => this.togglePanel());
    document.getElementById('close-feedback')?.addEventListener('click', () => this.closePanel());
    
    // Rating stars
    const stars = document.querySelectorAll('.rate-stars i');
    stars.forEach(star => {
      star.addEventListener('click', (e) => this.handleStarClick(e));
      star.addEventListener('mouseenter', (e) => this.handleStarHover(e));
    });
    
    document.querySelector('.rate-stars')?.addEventListener('mouseleave', () => {
      this.updateRatingDisplay();
    });
    
    // Feedback form
    document.getElementById('widget-feedback-form')?.addEventListener('submit', (e) => this.handleFeedbackSubmit(e));
    
    // Character counter
    document.getElementById('widget-feedback-text')?.addEventListener('input', (e) => {
      document.getElementById('widget-char-count').textContent = e.target.value.length;
    });
  }

  togglePanel() {
    this.isOpen ? this.closePanel() : this.openPanel();
  }

  openPanel() {
    const panel = document.getElementById('feedback-panel');
    if (panel) {
      panel.classList.add('open');
      this.isOpen = true;
    }
  }

  closePanel() {
    const panel = document.getElementById('feedback-panel');
    if (panel) {
      panel.classList.remove('open');
      this.isOpen = false;
    }
  }

  async handleStarClick(e) {
    const rating = parseInt(e.target.dataset.rating);
    
    if (!this.auth?.currentUser) {
      this.showMessage('widget-rate-message', 'Please sign in to rate', 'error');
      return;
    }
    
    this.currentRating = rating;
    const isUpdate = this.hasRated;
    
    try {
      const { doc, setDoc, getDoc, serverTimestamp, increment } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      // Check if updating existing rating
      const existingDoc = await getDoc(doc(this.db, 'feedback_ratings', this.auth.currentUser.uid));
      const updateCount = existingDoc.exists() ? (existingDoc.data().updateCount || 1) + 1 : 1;
      
      // FIXED: Use flat collection path 'feedback_ratings' instead of nested 'feedback/ratings'
      await setDoc(doc(this.db, 'feedback_ratings', this.auth.currentUser.uid), {
        rating: rating,
        email: this.auth.currentUser.email,
        displayName: this.auth.currentUser.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
        updateCount: updateCount,
        lastUpdated: serverTimestamp()
      });
      
      this.hasRated = true;
      
      // Show appropriate message
      if (isUpdate) {
        this.showMessage('widget-rate-message', `Rating updated to ${rating} stars!`, 'success');
      } else {
        this.showMessage('widget-rate-message', `Thank you! You rated ${rating} stars`, 'success');
      }
      
      // Update stats
      await this.updateStats();
      
      console.log(`✅ Rating ${isUpdate ? 'updated' : 'submitted'}: ${rating} stars`);
      
    } catch (error) {
      console.error('Rating error:', error);
      this.showMessage('widget-rate-message', 'Error submitting rating. Please try again.', 'error');
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
      
      // Submit feedback (unlimited submissions allowed)
      const feedbackData = {
        text: text,
        email: this.auth?.currentUser?.email || 'anonymous',
        displayName: this.auth?.currentUser?.displayName || 'Anonymous',
        userId: this.auth?.currentUser?.uid || null,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        authenticated: !!this.auth?.currentUser,
        userAgent: navigator.userAgent,
        // Additional metadata
        textLength: text.length,
        device: this.getDeviceType(),
        referrer: document.referrer || 'direct',
        currentPage: window.location.pathname
      };
      
      // FIXED: Use flat collection path 'feedback_comments' instead of nested 'feedback/comments'
      const docRef = await addDoc(collection(this.db, 'feedback_comments'), feedbackData);
      
      console.log(`✅ Feedback submitted with ID: ${docRef.id}`);
      
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
      this.showMessage('widget-form-message', 'Error submitting feedback. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalContent;
      submitBtn.disabled = false;
    }
  }

  getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  async checkUserRating() {
    if (!this.auth || !this.auth.currentUser || !this.db) return;
    
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      // FIXED: Use flat collection path 'feedback_ratings' instead of nested 'feedback/ratings'
      const ratingDoc = await getDoc(doc(this.db, 'feedback_ratings', this.auth.currentUser.uid));
      
      if (ratingDoc.exists()) {
        const data = ratingDoc.data();
        this.currentRating = data.rating;
        this.hasRated = true;
        this.updateRatingDisplay();
        
        // Show different message based on update count
        if (data.updateCount > 1) {
          this.showMessage('widget-rate-message', `You rated ${this.currentRating} stars (updated ${data.updateCount - 1} times)`, 'success');
        } else {
          this.showMessage('widget-rate-message', `You rated ${this.currentRating} stars - click to change`, 'success');
        }
      }
    } catch (error) {
      console.error('Error checking user rating:', error);
    }
  }

  async updateStats() {
    if (!this.db) return;
    
    try {
      const { collection, getDocs, doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      // FIXED: Use flat collection path 'feedback_ratings' instead of nested 'feedback/ratings'
      const ratingsSnapshot = await getDocs(collection(this.db, 'feedback_ratings'));
      
      let total = 0;
      let count = 0;
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let totalUpdates = 0;
      
      ratingsSnapshot.forEach((doc) => {
        const data = doc.data();
        const rating = data.rating;
        if (rating >= 1 && rating <= 5) {
          total += rating;
          count++;
          distribution[rating]++;
          totalUpdates += (data.updateCount || 1);
        }
      });
      
      const average = count > 0 ? (total / count) : 0;
      
      // FIXED: Use flat collection path 'feedback_stats' instead of nested 'feedback/stats'
      await setDoc(doc(this.db, 'feedback_stats', 'aggregate'), {
        averageRating: average,
        totalRatings: count,
        totalScore: total,
        distribution: distribution,
        totalUpdates: totalUpdates,
        lastUpdated: serverTimestamp()
      });
      
      // Update display
      this.updateAverageDisplay(average, count);
      
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  async subscribeToRatings() {
    if (!this.db) return;
    
    try {
      const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
      
      // FIXED: Use flat collection path 'feedback_stats' instead of nested 'feedback/stats'
      onSnapshot(doc(this.db, 'feedback_stats', 'aggregate'), (doc) => {
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
    // Update text
    const avgElement = document.getElementById('widget-avg-rating');
    const countElement = document.getElementById('widget-rating-count');
    
    if (avgElement) avgElement.textContent = average.toFixed(1);
    if (countElement) countElement.textContent = `(${count} rating${count !== 1 ? 's' : ''})`;
    
    // Update stars
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

  showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.className = `feedback-message ${type}`;
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        element.className = 'feedback-message';
      }, 5000);
    }
  }
}

// Initialize widget when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.feedbackWidget = new FeedbackWidget();
  });
} else {
  window.feedbackWidget = new FeedbackWidget();
}

// Export for use in other modules if needed
export default FeedbackWidget;