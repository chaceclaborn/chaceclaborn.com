// js/auth-init.js - Authentication with Smart Auto-Redirect by Tier (FIXED)
import { auth } from './firebase/config.js';
import { signInWithGoogle, signOutUser } from './firebase/auth-service.js';
import { 
    initializeUserTier, 
    autoAssignTier, 
    applyTierVisibility, 
    getUserTier, 
    TIERS 
} from './firebase/auth-tiers.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// DOM elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userPhoto = document.getElementById('user-photo');

// --- SMART REDIRECT LOGIC ---
function getRedirectPath(tier) {
    // Only redirect from homepage
    const currentPath = window.location.pathname;
    const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/');
    
    if (!isHomepage) {
        return null; // Don't redirect if already on a specific page
    }
    
    // Redirect based on tier
    switch(tier) {
        case TIERS.ADMIN:
            return '/pages/admin.html';
        case TIERS.GIRLFRIEND:
            return '/pages/girlfriend.html';
        case TIERS.FAMILY:
            return '/pages/family.html';
        case TIERS.AUTHENTICATED:
            // Regular authenticated users stay on homepage
            return null;
        default:
            return null;
    }
}

// --- SIGN IN ---
async function handleSignIn() {
    try {
        const user = await signInWithGoogle();
        if (user) {
            // Initialize user document with tier
            await initializeUserTier(user);
            await autoAssignTier(user);
            console.log('✅ User signed in:', user.email);
            
            // Get user tier and redirect appropriately
            const userTier = await getUserTier();
            console.log('🔑 User tier:', userTier);
            
            // Auto-redirect to appropriate dashboard WITHOUT showing overlay
            const redirectPath = getRedirectPath(userTier);
            if (redirectPath) {
                console.log(`🚀 Redirecting ${userTier} user to: ${redirectPath}`);
                
                // Direct redirect without welcome message overlay
                window.location.href = redirectPath;
            }
        }
    } catch (error) {
        console.error('❌ Error during sign in:', error);
        if (error.code === 'auth/popup-blocked') {
            alert('Please allow popups for this site to sign in.');
        } else if (error.code !== 'auth/cancelled-popup-request') {
            alert('Error signing in. Please try again.');
        }
    }
}

// --- REMOVED WELCOME MESSAGE OVERLAY ---
// This function has been removed to prevent the overlay popup

// --- SIGN OUT ---
async function handleSignOut() {
    try {
        await signOutUser();
        console.log('✅ User signed out');

        // Redirect to homepage if on a protected page
        if (window.location.pathname.includes('/pages/')) {
            window.location.href = '../index.html';
        }
    } catch (error) {
        console.error('❌ Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
}

// --- UI UPDATES ---
async function updateUI(user) {
    if (user) {
        // Show user info
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'block';

        if (userName) userName.textContent = user.displayName || 'User';
        if (userEmail) userEmail.textContent = user.email;

        if (userPhoto) {
            userPhoto.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=617140&color=fff`;
            userPhoto.alt = user.displayName || 'User photo';
            userPhoto.style.display = 'inline-block';
        }

        // Apply tier visibility
        const tier = await getUserTier();
        await applyTierVisibility();
        showTierNavigation(tier);
        console.log(`🔑 User tier: ${tier}`);
        
        // Add tier-specific features
        if (tier === TIERS.ADMIN) {
            addAdminFeatures();
        }
        
        // REMOVED: Dashboard button completely - no floating buttons
    } else {
        // Reset UI for signed-out state
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        if (userPhoto) {
            userPhoto.style.display = 'none';
            userPhoto.src = '';
        }
        await applyTierVisibility();
        hideTierNavigation();
        
        // Set body class for public users
        document.body.className = 'tier-public';
        
        // Remove any tier-specific features
        removeAdminFeatures();
        // REMOVED: Dashboard button removal - no floating buttons
    }
}

// --- DASHBOARD BUTTON REMOVED ---
// The floating dashboard button has been completely removed
// Users can access their dashboards through the navigation menu

// --- NAVIGATION BASED ON TIER ---
function showTierNavigation(tier) {
    // First hide ALL tier navigation
    document.querySelectorAll('.tier-nav').forEach(item => {
        item.style.display = 'none';
        item.style.visibility = 'hidden';
        item.style.opacity = '0';
    });
    
    // Show navigation based on tier hierarchy
    switch(tier) {
        case TIERS.ADMIN:
            document.querySelectorAll('.admin-nav').forEach(item => {
                item.style.display = '';
                item.style.visibility = 'visible';
                item.style.opacity = '1';
            });
            // Fall through to show all lower tiers
        case TIERS.GIRLFRIEND:
            document.querySelectorAll('.girlfriend-nav').forEach(item => {
                item.style.display = '';
                item.style.visibility = 'visible';
                item.style.opacity = '1';
            });
            // Fall through
        case TIERS.FAMILY:
            document.querySelectorAll('.family-nav').forEach(item => {
                item.style.display = '';
                item.style.visibility = 'visible';
                item.style.opacity = '1';
            });
            // Fall through
        case TIERS.AUTHENTICATED:
            document.querySelectorAll('.auth-nav').forEach(item => {
                item.style.display = '';
                item.style.visibility = 'visible';
                item.style.opacity = '1';
            });
            break;
    }
}

function hideTierNavigation() {
    document.querySelectorAll('.tier-nav').forEach(item => {
        item.style.display = 'none';
        item.style.visibility = 'hidden';
        item.style.opacity = '0';
    });
}

// --- ADMIN-ONLY FEATURES ---
function addAdminFeatures() {
    // Admin features are now handled through navigation menu
}

function removeAdminFeatures() {
    // Admin features cleanup if needed
}

// --- INIT AUTH STATE ---
function initializeAuth() {
    onAuthStateChanged(auth, async (user) => {
        await updateUI(user);
        
        if (user) {
            // Ensure tier assignment
            await autoAssignTier(user);
            
            // Check if we should auto-redirect (only on first load of homepage)
            const isFirstLoad = !sessionStorage.getItem('auth-loaded');
            if (isFirstLoad) {
                sessionStorage.setItem('auth-loaded', 'true');
                
                const userTier = await getUserTier();
                const redirectPath = getRedirectPath(userTier);
                
                if (redirectPath) {
                    console.log(`🚀 Auto-redirecting ${userTier} user to: ${redirectPath}`);
                    
                    // Direct redirect without overlay message
                    window.location.href = redirectPath;
                }
            }
        } else {
            // Clear session storage on logout
            sessionStorage.removeItem('auth-loaded');
        }
    });

    // Check for sign-in action in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'signin') {
        handleSignIn();
    }
}

// --- EVENT LISTENERS ---
if (loginBtn) loginBtn.addEventListener('click', handleSignIn);
if (logoutBtn) logoutBtn.addEventListener('click', handleSignOut);

// Initialize on load
initializeAuth();