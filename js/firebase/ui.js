// js/firebase/ui.js - FIXED UI with Proper Button Management
import { 
  signInWithGoogle, 
  signInWithEmail, 
  createAccount, 
  signOutUser,
  observeAuthState,
  getErrorMessage 
} from './auth-service.js';

// UI state
let isSignInMode = true;
let currentView = 'welcome';
let selectedAuthMethod = null;

// Initialize UI
export function initUI() {
  console.log('🎨 Initializing UI...');
  
  // Create modal
  createAuthModal();
  
  // Add terms to footer
  addTermsToFooter();
  
  // Set up auth state observer
  observeAuthState((user) => {
    updateUIForUser(user);
    
    // Close modal if user is signed in
    if (user) {
      closeAuthModal();
    }
  });
  
  // Set up event listeners
  setupEventListeners();
}

// Create auth modal
function createAuthModal() {
  const modalHTML = `
    <div id="authModal" class="auth-modal">
      <div class="auth-modal-content">
        <span class="close-modal" onclick="closeAuthModal()">&times;</span>
        
        <!-- Welcome View -->
        <div id="welcomeView" class="modal-view active">
          <h2>Welcome to ChaceClaborn.com</h2>
          <p style="color: #666; text-align: center; margin-bottom: 20px;">Choose how you'd like to continue</p>
          
          <div class="auth-methods">
            <button class="method-btn google-method" onclick="selectMethod('google')">
              <svg width="18" height="18" viewBox="0 0 48 48" style="margin-right: 10px;">
                <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.08 5.07-4.42 6.62v5.52h7.15c4.16-3.83 6.55-9.48 6.55-16.15z"/>
                <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.35l-7.15-5.52c-1.97 1.32-4.49 2.1-7.41 2.1-5.71 0-10.54-3.86-12.27-9.05H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                <path fill="#FBBC04" d="M11.73 28.18c-.44-1.32-.69-2.72-.69-4.18s.25-2.86.69-4.18V14.12H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.39-5.7z"/>
                <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.39 5.7c1.73-5.19 6.56-9.07 12.27-9.07z"/>
              </svg>
              Sign in with Google
            </button>
            
            <button class="method-btn email-method" onclick="selectMethod('email')">
              <span style="margin-right: 10px;">✉️</span>
              Sign in with Email
            </button>
          </div>
        </div>
        
        <!-- Auth View -->
        <div id="authView" class="modal-view" style="display: none;">
          <button class="back-button" onclick="showWelcome()">← Back</button>
          
          <h2 id="modalTitle">Sign In</h2>
          
          <div id="authError" class="auth-error" style="display: none;"></div>
          <div id="authSuccess" class="auth-success" style="display: none;">
            <i class="fas fa-check-circle"></i> Success! Signing you in...
          </div>
          
          <!-- Google Auth Section -->
          <div id="googleAuthSection" style="display: none;">
            <button id="googleBtn" class="google-btn">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.08 5.07-4.42 6.62v5.52h7.15c4.16-3.83 6.55-9.48 6.55-16.15z"/>
                <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.35l-7.15-5.52c-1.97 1.32-4.49 2.1-7.41 2.1-5.71 0-10.54-3.86-12.27-9.05H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                <path fill="#FBBC04" d="M11.73 28.18c-.44-1.32-.69-2.72-.69-4.18s.25-2.86.69-4.18V14.12H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.39-5.7z"/>
                <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.39 5.7c1.73-5.19 6.56-9.07 12.27-9.07z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
          
          <!-- Email Auth Section -->
          <div id="emailAuthSection" style="display: none;">
            <form id="emailForm">
              <input type="email" id="emailInput" placeholder="Email" required>
              <input type="password" id="passwordInput" placeholder="Password" required>
              
              <!-- Terms checkbox ONLY for new accounts -->
              <div id="termsSection" style="display: none; margin: 15px 0;">
                <label class="terms-checkbox">
                  <input type="checkbox" id="termsCheckbox">
                  <span style="font-size: 14px;">I agree to the <a href="#" onclick="showTermsModal(); return false;">Terms of Service</a> and <a href="#" onclick="showPrivacyModal(); return false;">Privacy Policy</a></span>
                </label>
                <div id="termsError" class="auth-error" style="display: none; margin-top: 10px;">
                  Please accept the Terms of Service and Privacy Policy
                </div>
              </div>
              
              <button type="submit" id="submitBtn">Sign In</button>
            </form>
            
            <p class="auth-toggle">
              <span id="toggleText">Don't have an account?</span>
              <a href="#" id="toggleLink">Create account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Add Terms to Footer
function addTermsToFooter() {
  // Wait for footer to load
  setTimeout(() => {
    const footer = document.querySelector('.site-footer') || document.querySelector('footer');
    if (!footer) return;
    
    const footerContent = footer.querySelector('.footer-content');
    if (!footerContent) return;
    
    // Check if terms already added
    if (document.getElementById('footer-terms-section')) return;
    
    // Create terms section
    const termsSection = document.createElement('div');
    termsSection.id = 'footer-terms-section';
    termsSection.style.cssText = `
      text-align: center;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 14px;
      opacity: 0.8;
    `;
    
    termsSection.innerHTML = `
      <a href="#" onclick="showTermsModal(); return false;" style="color: inherit; text-decoration: none; margin: 0 10px;">Terms of Service</a>
      <span>•</span>
      <a href="#" onclick="showPrivacyModal(); return false;" style="color: inherit; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
    `;
    
    footerContent.appendChild(termsSection);
  }, 1000);
}

// Show Terms Modal
window.showTermsModal = function() {
  const modal = document.createElement('div');
  modal.className = 'terms-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 10px; padding: 30px; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative;">
      <button onclick="this.closest('.terms-modal').remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
      <h2 style="color: #333; margin-bottom: 20px;">Terms of Service</h2>
      <div style="color: #555; line-height: 1.6;">
        <p><strong>1. Acceptance of Terms</strong><br>
        By accessing and using chaceclaborn.com, you agree to be bound by these Terms of Service.</p>
        
        <p><strong>2. User Accounts</strong><br>
        You are responsible for maintaining the confidentiality of your account and password.</p>
        
        <p><strong>3. Privacy</strong><br>
        Your use of our service is governed by our Privacy Policy.</p>
        
        <p><strong>4. Content</strong><br>
        All content on this website is the property of Chace Claborn unless otherwise stated.</p>
        
        <p><strong>5. Termination</strong><br>
        We reserve the right to terminate or suspend your account at our discretion.</p>
        
        <p><strong>6. Changes to Terms</strong><br>
        We may modify these terms at any time. Continued use constitutes acceptance of changes.</p>
        
        <p><strong>7. Contact</strong><br>
        Questions about these Terms should be sent to chaceclaborn@gmail.com.</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

// Show Privacy Modal
window.showPrivacyModal = function() {
  const modal = document.createElement('div');
  modal.className = 'privacy-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 10px; padding: 30px; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative;">
      <button onclick="this.closest('.privacy-modal').remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
      <h2 style="color: #333; margin-bottom: 20px;">Privacy Policy</h2>
      <div style="color: #555; line-height: 1.6;">
        <p><strong>Information We Collect</strong><br>
        We collect information you provide directly to us, such as when you create an account.</p>
        
        <p><strong>How We Use Information</strong><br>
        We use the information to provide, maintain, and improve our services.</p>
        
        <p><strong>Information Sharing</strong><br>
        We do not sell, trade, or otherwise transfer your personal information to third parties.</p>
        
        <p><strong>Data Security</strong><br>
        We implement appropriate technical and organizational measures to protect your data.</p>
        
        <p><strong>Your Rights</strong><br>
        You have the right to access, correct, or delete your personal information.</p>
        
        <p><strong>Cookies</strong><br>
        We use cookies to enhance your experience. You can control cookie settings in your browser.</p>
        
        <p><strong>Changes to This Policy</strong><br>
        We may update our Privacy Policy from time to time.</p>
        
        <p><strong>Contact Us</strong><br>
        If you have questions about this Privacy Policy, contact us at chaceclaborn@gmail.com.</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

// New workflow functions
window.selectMethod = function(method) {
  document.getElementById('welcomeView').style.display = 'none';
  document.getElementById('authView').style.display = 'block';
  
  if (method === 'google') {
    document.getElementById('googleAuthSection').style.display = 'block';
    document.getElementById('emailAuthSection').style.display = 'none';
  } else if (method === 'email') {
    document.getElementById('googleAuthSection').style.display = 'none';
    document.getElementById('emailAuthSection').style.display = 'block';
  }
  
  currentView = 'auth';
};

window.showWelcome = function() {
  document.getElementById('welcomeView').style.display = 'block';
  document.getElementById('authView').style.display = 'none';
  currentView = 'welcome';
  clearMessages();
};

// Set up event listeners - FIXED TO PREVENT DUPLICATE BUTTONS
function setupEventListeners() {
  // Sign in button
  const signInBtn = document.getElementById('signInBtn');
  if (signInBtn) {
    signInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal();
    });
    console.log('✅ Sign in button event listener attached');
  }
  
  // Sign out link
  const signOutLink = document.getElementById('signOutLink');
  if (signOutLink) {
    signOutLink.addEventListener('click', (e) => {
      e.preventDefault();
      handleSignOut();
    });
  }
  
  // Modal elements
  const modal = document.getElementById('authModal');
  const googleBtn = document.getElementById('googleBtn');
  const emailForm = document.getElementById('emailForm');
  const toggleLink = document.getElementById('toggleLink');
  
  // Close modal on background click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAuthModal();
    });
  }
  
  // Google sign in
  if (googleBtn) {
    googleBtn.addEventListener('click', handleGoogleSignIn);
  }
  
  // Email form
  if (emailForm) {
    emailForm.addEventListener('submit', handleEmailAuth);
  }
  
  // Toggle mode
  if (toggleLink) {
    toggleLink.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAuthMode();
    });
  }
}

// Handle Google sign in
async function handleGoogleSignIn() {
  clearMessages();
  try {
    const user = await signInWithGoogle();
    if (user) {
      showSuccess('Signing you in...');
      
      // Import necessary functions for tier-based redirect
      const { initializeUserTier, autoAssignTier, getUserTier } = await import('./auth-tiers.js');
      const { getRedirectPath } = await import('../auth-init.js');
      
      // Initialize user tier
      await initializeUserTier(user);
      await autoAssignTier(user);
      
      // Get user tier and redirect if needed
      const userTier = await getUserTier();
      const redirectPath = getRedirectPath(userTier);
      
      if (redirectPath) {
        console.log(`🚀 Redirecting ${userTier} user to: ${redirectPath}`);
        window.location.href = redirectPath;
      }
    }
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user' && 
        error.code !== 'auth/cancelled-popup-request') {
      showError(getErrorMessage(error));
    }
  }
}

// Handle email auth
async function handleEmailAuth(e) {
  e.preventDefault();
  clearMessages();
  
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  
  try {
    let user;
    
    if (isSignInMode) {
      // SIGN IN - No terms required
      user = await signInWithEmail(email, password);
    } else {
      // CREATE ACCOUNT - Terms required
      const termsCheckbox = document.getElementById('termsCheckbox');
      if (!termsCheckbox.checked) {
        document.getElementById('termsError').style.display = 'block';
        return;
      }
      
      user = await createAccount(email, password);
      
      // Save terms acceptance
      if (user) {
        const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
        const { db } = await import('./config.js');
        
        await updateDoc(doc(db, 'users', user.uid), {
          termsAccepted: true,
          termsAcceptedAt: serverTimestamp()
        });
      }
    }
    
    if (user) {
      showSuccess('Signing you in...');
      
      // Redirect logic
      const { initializeUserTier, autoAssignTier, getUserTier } = await import('./auth-tiers.js');
      const { getRedirectPath } = await import('../auth-init.js');
      
      await initializeUserTier(user);
      await autoAssignTier(user);
      
      const userTier = await getUserTier();
      const redirectPath = getRedirectPath(userTier);
      
      if (redirectPath) {
        window.location.href = redirectPath;
      }
    }
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user' && 
        error.code !== 'auth/cancelled-popup-request') {
      showError(getErrorMessage(error));
    }
  }
}

// Handle sign out
async function handleSignOut() {
  try {
    await signOutUser();
  } catch (error) {
    console.error('Sign out error:', error);
    alert('Error signing out. Please try again.');
  }
}

// Toggle auth mode
function toggleAuthMode() {
  isSignInMode = !isSignInMode;
  clearMessages();
  
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');
  const toggleText = document.getElementById('toggleText');
  const toggleLink = document.getElementById('toggleLink');
  const termsSection = document.getElementById('termsSection');
  
  if (isSignInMode) {
    // SIGN IN MODE - Hide terms
    modalTitle.textContent = 'Sign In';
    submitBtn.textContent = 'Sign In';
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = 'Create account';
    if (termsSection) termsSection.style.display = 'none';
  } else {
    // CREATE ACCOUNT MODE - Show terms
    modalTitle.textContent = 'Create Account';
    submitBtn.textContent = 'Create Account';
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Sign in';
    if (termsSection) termsSection.style.display = 'block';
  }
}

// Update UI for user - FIXED TO PROPERLY MANAGE BUTTON VISIBILITY
function updateUIForUser(user) {
  const signInBtn = document.getElementById('signInBtn');
  const signOutLink = document.getElementById('signOutLink');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const userAvatar = document.getElementById('userAvatar');
  
  if (user) {
    // User is signed in - Hide sign in, show sign out
    if (signInBtn) signInBtn.style.display = 'none';
    if (signOutLink) signOutLink.style.display = 'inline';
    if (userInfo) {
      userInfo.style.display = 'flex';
      if (userName) userName.textContent = user.displayName || user.email;
      if (userEmail) userEmail.textContent = user.email;
      if (userAvatar) {
        userAvatar.src = user.photoURL || 
          `https://ui-avatars.com/api/?name=${user.email}&background=617140&color=fff`;
      }
    }
  } else {
    // User is signed out - Show sign in, hide sign out
    if (signInBtn) signInBtn.style.display = 'inline-block';
    if (signOutLink) signOutLink.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
  }
}

// Modal functions
function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'flex';
    showWelcome();
    clearMessages();
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'none';
    showWelcome();
    clearMessages();
    const form = document.getElementById('emailForm');
    if (form) form.reset();
    
    // Reset terms checkbox
    const termsCheckbox = document.getElementById('termsCheckbox');
    if (termsCheckbox) termsCheckbox.checked = false;
  }
}

// Message functions
function showError(message) {
  const errorEl = document.getElementById('authError');
  const successEl = document.getElementById('authSuccess');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
  if (successEl) {
    successEl.style.display = 'none';
  }
}

function showSuccess(message) {
  const errorEl = document.getElementById('authError');
  const successEl = document.getElementById('authSuccess');
  if (successEl) {
    successEl.textContent = message;
    successEl.style.display = 'block';
  }
  if (errorEl) {
    errorEl.style.display = 'none';
  }
}

function clearMessages() {
  const errorEl = document.getElementById('authError');
  const successEl = document.getElementById('authSuccess');
  const termsError = document.getElementById('termsError');
  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
  if (termsError) termsError.style.display = 'none';
}

// Make functions available globally
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;