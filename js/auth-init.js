// js/auth-init.js - Authentication Initialization with Debug
import { initUI } from './firebase/ui.js';

// Initialize when DOM is ready
function init() {
  console.log('🚀 Starting authentication initialization...');
  
  try {
    initUI();
    console.log('✅ Authentication system initialized successfully');
    
    // Debug: Check if elements exist
    console.log('🔍 Debug - Elements found:');
    console.log('  - Sign In Button:', !!document.getElementById('signInBtn'));
    console.log('  - Auth Modal:', !!document.getElementById('authModal'));
    console.log('  - User Info:', !!document.getElementById('userInfo'));
    
    // Debug: Check if functions are available
    console.log('🔍 Debug - Functions available:');
    console.log('  - openAuthModal:', typeof window.openAuthModal);
    console.log('  - closeAuthModal:', typeof window.closeAuthModal);
    
  } catch (error) {
    console.error('❌ Initialization error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Add error handler
window.addEventListener('error', (e) => {
  console.error('❌ Global error:', e.error);
});