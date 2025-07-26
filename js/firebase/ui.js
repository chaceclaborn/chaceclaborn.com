// js/firebase/ui.js - UI Controller with Fixed Modal Closing
import { 
  signInWithGoogle, 
  signInWithEmail, 
  createAccount, 
  signOutUser,
  observeAuthState,
  getErrorMessage 
} from './auth-service.js'; // CHANGED from './auth.js'

// UI state
let isSignInMode = true;

// Initialize UI
export function initUI() {
  console.log('🎨 Initializing UI...');
  
  // Create modal
  createAuthModal();
  
  // Set up auth state observer
  observeAuthState((user) => {
    updateUIForUser(user);
    
    // IMPORTANT: Close modal if user is signed in
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
        
        <h2 id="modalTitle">Sign In</h2>
        
        <div id="authError" class="auth-error" style="display: none;"></div>
        <div id="authSuccess" class="auth-success" style="display: none;">
          <i class="fas fa-check-circle"></i> Success! Signing you in...
        </div>
        
        <button id="googleBtn" class="google-btn">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.08 5.07-4.42 6.62v5.52h7.15c4.16-3.83 6.55-9.48 6.55-16.15z"/>
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.35l-7.15-5.52c-1.97 1.32-4.49 2.1-7.41 2.1-5.71 0-10.54-3.86-12.27-9.05H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
            <path fill="#FBBC04" d="M11.73 28.18c-.44-1.32-.69-2.72-.69-4.18s.25-2.86.69-4.18V14.12H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.39-5.7z"/>
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.39 5.7c1.73-5.19 6.56-9.07 12.27-9.07z"/>
          </svg>
          Sign in with Google
        </button>
        
        <div class="divider">OR</div>
        
        <form id="emailForm">
          <input type="email" id="emailInput" placeholder="Email" required>
          <input type="password" id="passwordInput" placeholder="Password" required>
          <button type="submit" id="submitBtn">Sign In</button>
        </form>
        
        <p class="auth-toggle">
          <span id="toggleText">Don't have an account?</span>
          <a href="#" id="toggleLink">Create account</a>
        </p>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
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
    await signInWithGoogle();
    showSuccess('Signing you in...');
    // Modal will close automatically via auth state observer
  } catch (error) {
    showError(getErrorMessage(error));
  }
}

// Handle email auth
async function handleEmailAuth(e) {
  e.preventDefault();
  clearMessages();
  
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  
  try {
    if (isSignInMode) {
      await signInWithEmail(email, password);
    } else {
      await createAccount(email, password);
    }
    showSuccess('Signing you in...');
    // Modal will close automatically via auth state observer
  } catch (error) {
    showError(getErrorMessage(error));
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
  
  document.getElementById('modalTitle').textContent = isSignInMode ? 'Sign In' : 'Create Account';
  document.getElementById('submitBtn').textContent = isSignInMode ? 'Sign In' : 'Create Account';
  document.getElementById('toggleText').textContent = isSignInMode ? "Don't have an account?" : 'Already have an account?';
  document.getElementById('toggleLink').textContent = isSignInMode ? 'Create account' : 'Sign in';
}

// Update UI for user
function updateUIForUser(user) {
  const signInBtn = document.getElementById('signInBtn');
  const userInfo = document.getElementById('userInfo');
  const memberNav = document.getElementById('memberNav');
  
  if (user) {
    // User is signed in
    if (signInBtn) signInBtn.style.display = 'none';
    if (userInfo) {
      userInfo.style.display = 'flex';
      document.getElementById('userEmail').textContent = user.email;
      document.getElementById('userAvatar').src = user.photoURL || 
        `https://ui-avatars.com/api/?name=${user.email}&background=617140&color=fff`;
    }
    if (memberNav) memberNav.style.display = 'block';
  } else {
    // User is signed out
    if (signInBtn) signInBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
    if (memberNav) memberNav.style.display = 'none';
  }
}

// Modal functions
function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'flex';
    clearMessages();
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = 'none';
    clearMessages();
    const form = document.getElementById('emailForm');
    if (form) form.reset();
  }
}

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
  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
}

// Make modal functions global
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;