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
      
      // Load external CSS
      this.loadCSS();
      
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

  loadCSS() {
    // Check if CSS already loaded
    if (!document.getElementById('feedback-widget-styles')) {
      const link = document.createElement('link');
      link.id = 'feedback-widget-styles';
      link.rel = 'stylesheet';
      link.href = 'css/feedback-widget.css'; // Adjust path as needed
      document.head.appendChild(link);
      console.log('✅ Feedback Widget: CSS loaded');
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
                <i class="fas fa-chevron-right"></i>
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
    
    // Note: External CSS is kept in case other instances need it
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