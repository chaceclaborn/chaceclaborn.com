// js/firebase/ui.js - FIXED UI with Proper Terms Management
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
          <div id="authLoading" class="auth-loading" style="display: none;">
            Signing you in...
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
    termsSection.className = 'footer-section';
    termsSection.innerHTML = `
      <h3>Legal</h3>
      <ul>
        <li><a href="#" onclick="showTermsModal(); return false;">Terms of Service</a></li>
        <li><a href="#" onclick="showPrivacyModal(); return false;">Privacy Policy</a></li>
      </ul>
    `;
    
    footerContent.appendChild(termsSection);
  }, 1000);
}

// Open modal
window.openAuthModal = function() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'flex';
    showWelcome(); // Always start with welcome view
  }
};

// Close modal
window.closeAuthModal = function() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'none';
    clearMessages();
    // Reset to welcome view for next time
    showWelcome();
  }
};

// Update UI for user
function updateUIForUser(user) {
  const signInBtn = document.getElementById('signInBtn');
  const signOutLink = document.getElementById('signOutLink');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  
  if (user) {
    // User is signed in
    if (signInBtn) signInBtn.style.display = 'none';
    if (signOutLink) signOutLink.style.display = 'inline';
    if (userInfo) userInfo.style.display = 'inline';
    if (userName) {
      userName.textContent = user.displayName || user.email.split('@')[0];
    }
  } else {
    // User is signed out
    if (signInBtn) signInBtn.style.display = 'inline';
    if (signOutLink) signOutLink.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
  }
}

// Toggle between sign in and create account
function toggleAuthMode() {
  isSignInMode = !isSignInMode;
  
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');
  const toggleText = document.getElementById('toggleText');
  const toggleLink = document.getElementById('toggleLink');
  const termsSection = document.getElementById('termsSection');
  
  if (isSignInMode) {
    modalTitle.textContent = 'Sign In';
    submitBtn.textContent = 'Sign In';
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = 'Create account';
    if (termsSection) termsSection.style.display = 'none';
  } else {
    modalTitle.textContent = 'Create Account';
    submitBtn.textContent = 'Create Account';
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Sign in';
    
    // Only show terms for new accounts if not already accepted
    if (termsSection && localStorage.getItem('termsAccepted') !== 'true') {
      termsSection.style.display = 'block';
    }
  }
  
  clearMessages();
}

// Clear messages
function clearMessages() {
  const errorDiv = document.getElementById('authError');
  const successDiv = document.getElementById('authSuccess');
  const loadingDiv = document.getElementById('authLoading');
  
  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }
  if (successDiv) {
    successDiv.style.display = 'none';
  }
  if (loadingDiv) {
    loadingDiv.style.display = 'none';
  }
}

// Show error
function showError(message) {
  const errorDiv = document.getElementById('authError');
  const loadingDiv = document.getElementById('authLoading');
  
  if (loadingDiv) loadingDiv.style.display = 'none';
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

// Show success
function showSuccess(message) {
  const successDiv = document.getElementById('authSuccess');
  const loadingDiv = document.getElementById('authLoading');
  
  if (loadingDiv) loadingDiv.style.display = 'none';
  if (successDiv) {
    successDiv.style.display = 'block';
  }
}

// Set up event listeners
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
  
  // Google sign in - NOT needed here since selectMethod handles it
  
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

// NEW: Improved selectMethod function with terms for Google users
window.selectMethod = async function(method) {
  if (method === 'google') {
    // Check if user has accepted terms before
    const hasAcceptedTerms = localStorage.getItem('termsAccepted') === 'true';
    
    if (!hasAcceptedTerms) {
      // Show terms modal for first-time Google users
      showTermsModalForGoogle();
    } else {
      // Proceed directly with Google sign-in
      handleGoogleSignIn();
    }
  } else if (method === 'email') {
    // Show email form as before
    document.getElementById('welcomeView').style.display = 'none';
    document.getElementById('authView').style.display = 'block';
    document.getElementById('googleAuthSection').style.display = 'none';
    document.getElementById('emailAuthSection').style.display = 'block';
    currentView = 'auth';
  }
};

// NEW: Show terms modal specifically for Google sign-in
window.showTermsModalForGoogle = function() {
  const modalHTML = `
    <div id="googleTermsModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
      <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <h3 style="margin-bottom: 20px;">Terms of Service & Privacy Policy</h3>
        
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
          <p style="font-size: 14px; line-height: 1.5;">By using this website, you agree to our Terms of Service and Privacy Policy.</p>
          <p style="font-size: 14px; line-height: 1.5; margin-top: 10px;">
            <strong>Terms of Service Summary:</strong><br>
            • This is a personal portfolio website<br>
            • Content is for informational purposes<br>
            • Respect intellectual property rights<br>
            • No harmful or illegal activities
          </p>
          <p style="font-size: 14px; line-height: 1.5; margin-top: 10px;">
            <strong>Privacy Policy Summary:</strong><br>
            • We collect minimal data for authentication<br>
            • Your data is stored securely via Firebase<br>
            • We don't share your data with third parties<br>
            • You can request data deletion at any time
          </p>
          <p style="font-size: 12px; margin-top: 15px;">
            <a href="#" onclick="showTermsModal(); return false;">View Full Terms</a> | 
            <a href="#" onclick="showPrivacyModal(); return false;">View Full Privacy Policy</a>
          </p>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button onclick="closeGoogleTermsModal()" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button onclick="acceptGoogleTerms()" style="padding: 10px 20px; background: #617140; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.closeGoogleTermsModal = function() {
  const modal = document.getElementById('googleTermsModal');
  if (modal) modal.remove();
};

window.acceptGoogleTerms = function() {
  // Mark terms as accepted
  localStorage.setItem('termsAccepted', 'true');
  localStorage.setItem('termsAcceptedDate', new Date().toISOString());
  
  // Close terms modal
  closeGoogleTermsModal();
  
  // Proceed with Google sign-in
  handleGoogleSignIn();
};

window.showWelcome = function() {
  document.getElementById('welcomeView').style.display = 'block';
  document.getElementById('authView').style.display = 'none';
  currentView = 'welcome';
  clearMessages();
};

// Handle Google sign in - UPDATED
async function handleGoogleSignIn() {
  clearMessages();
  
  // Show loading state
  const loadingDiv = document.getElementById('authLoading');
  if (loadingDiv) {
    loadingDiv.style.display = 'block';
  }
  
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
      
      // Close modal after successful sign-in
      closeAuthModal();
    }
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user' && 
        error.code !== 'auth/cancelled-popup-request') {
      showError(getErrorMessage(error));
    }
  } finally {
    // Hide loading state
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  }
}

// Handle email auth - UPDATED to track terms
async function handleEmailAuth(e) {
  e.preventDefault();
  clearMessages();
  
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  const termsCheckbox = document.getElementById('termsCheckbox');
  
  // Check terms for new accounts
  if (!isSignInMode && termsCheckbox && !termsCheckbox.checked) {
    showError('Please accept the Terms of Service and Privacy Policy');
    return;
  }
  
  try {
    let user;
    if (isSignInMode) {
      // Sign in existing user
      user = await signInWithEmail(email, password);
    } else {
      // Create new account
      user = await createAccount(email, password);
      
      // Mark terms as accepted for new accounts
      if (termsCheckbox && termsCheckbox.checked) {
        localStorage.setItem('termsAccepted', 'true');
        localStorage.setItem('termsAcceptedDate', new Date().toISOString());
      }
    }
    
    if (user) {
      showSuccess('Success! Redirecting...');
      
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
      
      // Close modal
      setTimeout(() => {
        closeAuthModal();
      }, 1000);
    }
  } catch (error) {
    showError(getErrorMessage(error));
  }
}

// Handle sign out
async function handleSignOut() {
  try {
    await signOutUser();
    console.log('✅ User signed out');
    
    // Redirect if on protected page
    const protectedPages = ['dashboard', 'family', 'girlfriend', 'admin'];
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    if (protectedPages.includes(currentPage)) {
      window.location.href = window.location.pathname.includes('/pages/') 
        ? '../index.html' 
        : 'index.html';
    }
  } catch (error) {
    console.error('❌ Error signing out:', error);
    alert('Error signing out. Please try again.');
  }
}

// Show Terms Modal
window.showTermsModal = function() {
  const modal = document.createElement('div');
  modal.id = 'termsModal';
  modal.className = 'legal-modal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10001;';
  
  modal.innerHTML = `
    <div class="legal-content" style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
      <span class="close-legal" onclick="this.parentElement.parentElement.remove()" style="float: right; font-size: 30px; cursor: pointer;">&times;</span>
      <h2>Terms of Service</h2>
      <div class="legal-text">
        <p><strong>1. Acceptance of Terms</strong><br>
        By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <p><strong>2. Use License</strong><br>
        Permission is granted to temporarily view the materials on ChaceClaborn.com for personal, non-commercial use only.</p>
        
        <p><strong>3. Disclaimer</strong><br>
        The materials on this website are provided on an 'as is' basis. ChaceClaborn.com makes no warranties, expressed or implied.</p>
        
        <p><strong>4. Limitations</strong><br>
        In no event shall ChaceClaborn.com or its suppliers be liable for any damages arising out of the use or inability to use the materials on this website.</p>
        
        <p><strong>5. Revisions</strong><br>
        ChaceClaborn.com may revise these terms of service at any time without notice.</p>
        
        <p><strong>6. Contact Information</strong><br>
        If you have any questions about these Terms, please contact us at chaceclaborn@gmail.com.</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

// Show Privacy Modal
window.showPrivacyModal = function() {
  const modal = document.createElement('div');
  modal.id = 'privacyModal';
  modal.className = 'legal-modal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10001;';
  
  modal.innerHTML = `
    <div class="legal-content" style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
      <span class="close-legal" onclick="this.parentElement.parentElement.remove()" style="float: right; font-size: 30px; cursor: pointer;">&times;</span>
      <h2>Privacy Policy</h2>
      <div class="legal-text">
        <p><strong>Information We Collect</strong><br>
        We collect information you provide directly to us, such as when you create an account or contact us.</p>
        
        <p><strong>How We Use Your Information</strong><br>
        We use the information to provide, maintain, and improve our services, and to communicate with you.</p>
        
        <p><strong>Information Sharing</strong><br>
        We do not sell, trade, or otherwise transfer your personal information to third parties.</p>
        
        <p><strong>Data Security</strong><br>
        We implement appropriate security measures to protect your personal information.</p>
        
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

// ADD THIS AT THE END OF YOUR ui.js FILE
// MOBILE MODAL FIX - Ensures modal works on all devices

// Override openAuthModal to ensure mobile compatibility
window.openAuthModal = function() {
  const modal = document.getElementById('authModal');
  if (modal) {
    // Force display flex with important styles for mobile
    modal.style.cssText = `
      display: flex !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.5) !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 99999 !important;
      padding: 20px !important;
    `;
    
    // Ensure welcome view is visible
    const welcomeView = document.getElementById('welcomeView');
    const authView = document.getElementById('authView');
    
    if (welcomeView) {
      welcomeView.style.display = 'block';
      welcomeView.classList.add('active');
    }
    if (authView) {
      authView.style.display = 'none';
      authView.classList.remove('active');
    }
    
    // Force re-render on mobile
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        const content = document.querySelector('.auth-modal-content');
        if (content) {
          content.style.opacity = '1';
          content.style.visibility = 'visible';
        }
      }, 10);
    }
  }
};

// Override closeAuthModal for mobile compatibility
window.closeAuthModal = function() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'none';
    // Reset to welcome view for next time
    const welcomeView = document.getElementById('welcomeView');
    const authView = document.getElementById('authView');
    if (welcomeView) {
      welcomeView.style.display = 'block';
      welcomeView.classList.add('active');
    }
    if (authView) {
      authView.style.display = 'none';
      authView.classList.remove('active');
    }
  }
};

// Fix selectMethod for mobile
window.selectMethod = async function(method) {
  // Check for mobile
  const isMobile = window.innerWidth <= 768;
  
  if (method === 'google') {
    // Check if user has accepted terms
    const hasAcceptedTerms = localStorage.getItem('termsAccepted') === 'true';
    
    if (!hasAcceptedTerms) {
      // Show simple terms confirmation for mobile
      if (isMobile) {
        const accepted = confirm(
          'By continuing, you agree to our Terms of Service and Privacy Policy.\n\n' +
          'Key Points:\n' +
          '• We collect minimal data for authentication\n' +
          '• Your data is secure with Firebase\n' +
          '• We don\'t share your data with third parties\n' +
          '• You can delete your account anytime\n\n' +
          'Click OK to accept and continue with Google sign-in.'
        );
        
        if (accepted) {
          localStorage.setItem('termsAccepted', 'true');
          localStorage.setItem('termsAcceptedDate', new Date().toISOString());
          handleGoogleSignIn();
        }
      } else {
        // Desktop - show full terms modal
        showTermsModalForGoogle();
      }
    } else {
      // Already accepted - proceed with sign-in
      handleGoogleSignIn();
    }
  } else if (method === 'email') {
    // Switch to email view
    document.getElementById('welcomeView').style.display = 'none';
    document.getElementById('authView').style.display = 'block';
    document.getElementById('googleAuthSection').style.display = 'none';
    document.getElementById('emailAuthSection').style.display = 'block';
  }
};

// Ensure mobile click handlers work
document.addEventListener('DOMContentLoaded', function() {
  // Re-attach click handlers for mobile
  setTimeout(() => {
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
      signInBtn.onclick = function(e) {
        e.preventDefault();
        window.openAuthModal();
      };
    }
  }, 500);
});