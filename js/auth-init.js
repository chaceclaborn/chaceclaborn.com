// js/auth-init.js - Authentication with Smart Auto-Redirect by Tier (FIXED EVENT LISTENERS)
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

// --- HELPER FUNCTIONS ---
function isProtectedPage() {
    // These pages require authentication
    const protectedPages = ['dashboard', 'family', 'girlfriend', 'admin'];
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    return protectedPages.includes(currentPage);
}

function isPublicPage() {
    // These pages are ALWAYS public
    const publicPages = ['index', 'portfolio', 'resume', 'about', 'contact', ''];
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    return publicPages.includes(currentPage) || currentPage === '';
}

// --- SMART REDIRECT LOGIC (PRESERVED) ---
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

// --- SIGN IN (PRESERVED) ---
async function handleSignIn(e) {
    if (e) e.preventDefault();
    
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

// --- SIGN OUT (PRESERVED) ---
async function handleSignOut(e) {
    if (e) e.preventDefault();
    
    try {
        await signOutUser();
        console.log('✅ User signed out');

        // Only redirect if on a protected page
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

// --- UI UPDATES (PRESERVED) ---
async function updateUI(user) {
    // Get elements fresh each time (in case DOM changed)
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userPhoto = document.getElementById('user-photo');
    
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

        // Apply tier visibility (but not on public pages)
        const tier = await getUserTier();
        console.log(`🔑 User tier: ${tier}`);
        
        // Don't override body class - let navigation.js handle it
        // await applyTierVisibility();
        
        // Add tier-specific features
        if (tier === TIERS.ADMIN) {
            addAdminFeatures();
        }
        
    } else {
        // Reset UI for signed-out state
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        if (userPhoto) {
            userPhoto.style.display = 'none';
            userPhoto.src = '';
        }
        
        // Don't apply tier visibility - let navigation.js handle it
        // if (!isPublicPage()) {
        //     await applyTierVisibility();
        // }
        
        // Don't set body class - let navigation.js handle it
        // document.body.className = document.body.className.replace(/tier-\w+/g, '');
        // document.body.classList.add('tier-public');
        
        // Remove any tier-specific features
        removeAdminFeatures();
    }
}

// --- NAVIGATION BASED ON TIER ---
// NOTE: These functions are preserved but won't be called since navigation.js handles this
// Keeping them in case you need them for other purposes
function showTierNavigation(tier) {
    // Navigation component handles this now, but keeping function for compatibility
    console.log('Tier navigation is now handled by navigation.js component');
}

function hideTierNavigation() {
    // Navigation component handles this now, but keeping function for compatibility
    console.log('Tier navigation is now handled by navigation.js component');
}

// --- ADMIN-ONLY FEATURES (PRESERVED) ---
function addAdminFeatures() {
    // Admin features are now handled through navigation menu
    // Add any additional admin-specific features here if needed
}

function removeAdminFeatures() {
    // Admin features cleanup if needed
}

// --- SETUP EVENT LISTENERS (FIXED) ---
function setupEventListeners() {
    // Use event delegation on document body to catch clicks on login/logout buttons
    // This ensures it works even if buttons are added/removed dynamically
    
    document.addEventListener('click', async (e) => {
        // Check if clicked element is login button
        if (e.target && (e.target.id === 'login-btn' || e.target.closest('#login-btn'))) {
            e.preventDefault();
            console.log('🔐 Login button clicked');
            await handleSignIn(e);
        }
        
        // Check if clicked element is logout button
        if (e.target && (e.target.id === 'logout-btn' || e.target.closest('#logout-btn'))) {
            e.preventDefault();
            console.log('👋 Logout button clicked');
            await handleSignOut(e);
        }
    });
    
    console.log('✅ Event listeners attached with delegation');
}

// --- MOBILE MENU FUNCTIONALITY (PRESERVED) ---
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.main-nav');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-active');
            mobileMenuBtn.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navMenu.classList.remove('mobile-active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
}

// --- INIT AUTH STATE (PRESERVED) ---
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
        setTimeout(() => {
            handleSignIn();
        }, 500);
    }
}

// --- INITIALIZE EVERYTHING ---
function initialize() {
    console.log('🚀 Auth-init starting...');
    
    // Setup event listeners (MUST be first!)
    setupEventListeners();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Initialize auth state monitoring
    initializeAuth();
    
    console.log('✅ Auth-init complete');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM already loaded, initialize immediately
    initialize();
}

// Export functions if needed by other modules
export { handleSignIn, handleSignOut, getRedirectPath, initializeAuth };

// Make functions available globally for debugging
window.authFunctions = {
    handleSignIn,
    handleSignOut,
    getUserTier,
    getRedirectPath
};