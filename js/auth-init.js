// js/auth-init.js - Authentication with tier system
import { auth } from './firebase/config.js';
import { signInWithGoogle, signOutUser } from './firebase/auth-service.js';
import { 
    initializeUserTier, 
    autoAssignTier, 
    applyTierVisibility, 
    getUserTier, 
    TIERS 
} from './firebase/auth-tiers.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// DOM elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userPhoto = document.getElementById('user-photo');

// Sign in function with tier initialization
async function handleSignIn() {
    try {
        const user = await signInWithGoogle();
        if (user) {
            // Initialize user document with tier
            await initializeUserTier(user);
            
            // Auto-assign tier based on email
            await autoAssignTier(user);
            
            console.log('User signed in:', user.email);
        }
    } catch (error) {
        console.error('Error during sign in:', error);
        
        // Show user-friendly error message
        if (error.code === 'auth/popup-blocked') {
            alert('Please allow popups for this site to sign in.');
        } else if (error.code === 'auth/cancelled-popup-request') {
            // User cancelled, no need to show error
        } else {
            alert('Error signing in. Please try again.');
        }
    }
}

// Sign out function
async function handleSignOut() {
    try {
        await signOutUser();
        console.log('User signed out');
        
        // Redirect to home page after sign out if on protected page
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = '../index.html';
        }
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
}

// Update UI based on auth state and tier
async function updateUI(user) {
    if (user) {
        // User is signed in
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'block';
        
        if (userName) userName.textContent = user.displayName || 'User';
        if (userEmail) userEmail.textContent = user.email;
        
        // Set user photo if available
        if (userPhoto && user.photoURL) {
            userPhoto.src = user.photoURL;
            userPhoto.alt = user.displayName || 'User photo';
            userPhoto.style.display = 'inline-block';
        }
        
        // Get user tier (for functionality, not display)
        const tier = await getUserTier();
        
        // Apply tier-based visibility
        await applyTierVisibility();
        
        // Show tier-specific navigation
        showTierNavigation(tier);
        
        // Log user tier for debugging
        console.log(`User ${user.email} has tier: ${tier}`);
    } else {
        // User is signed out
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        
        // Hide user photo when signed out
        if (userPhoto) {
            userPhoto.style.display = 'none';
            userPhoto.src = '';
        }
        
        // Apply public tier visibility
        await applyTierVisibility();
        
        // Hide all tier-specific navigation
        hideTierNavigation();
        
        // Set body class to public
        document.body.className = 'tier-public';
    }
}

// Show navigation items based on tier
function showTierNavigation(tier) {
    // Hide all tier nav items first
    document.querySelectorAll('.tier-nav').forEach(item => {
        item.style.display = 'none';
    });
    
    // Show appropriate nav items based on tier hierarchy
    switch(tier) {
        case TIERS.ADMIN:
            document.querySelectorAll('.admin-nav').forEach(item => {
                item.style.display = '';
            });
            // Fall through to show family items too
        case TIERS.FAMILY:
            document.querySelectorAll('.family-nav').forEach(item => {
                item.style.display = '';
            });
            // Fall through to show authenticated items too
        case TIERS.AUTHENTICATED:
            document.querySelectorAll('.auth-nav').forEach(item => {
                item.style.display = '';
            });
            break;
    }
}

// Hide all tier navigation
function hideTierNavigation() {
    document.querySelectorAll('.tier-nav').forEach(item => {
        item.style.display = 'none';
    });
}

// Initialize auth state listener
function initializeAuth() {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
        updateUI(user);
    });
    
    // Check for auth action in URL
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'signin') {
        handleSignIn();
    }
}

// Event listeners
if (loginBtn) loginBtn.addEventListener('click', handleSignIn);
if (logoutBtn) logoutBtn.addEventListener('click', handleSignOut);

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeAuth);

// Export functions for use in other modules
export { handleSignIn, handleSignOut };