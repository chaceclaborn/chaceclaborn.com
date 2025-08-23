// js/auth-init.js - Authentication Initialization with Terms Manager
import { auth } from './firebase/config.js';
import { signOutUser } from './firebase/auth-service.js';
import { 
    initializeUserTier, 
    autoAssignTier, 
    applyTierVisibility, 
    getUserTier, 
    TIERS 
} from './firebase/auth-tiers.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { initUI } from './firebase/ui.js';
import termsManager from './firebase/terms-manager.js'; // Import terms manager

// --- HELPER FUNCTIONS ---
function isProtectedPage() {
    const protectedPages = ['dashboard', 'family', 'girlfriend', 'admin'];
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    return protectedPages.includes(currentPage);
}

function isPublicPage() {
    const publicPages = ['index', 'portfolio', 'resume', 'about', 'contact', ''];
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    return publicPages.includes(currentPage) || currentPage === '';
}

// --- SMART REDIRECT LOGIC ---
export function getRedirectPath(tier) {
    const currentPath = window.location.pathname;
    const isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/');
    
    if (!isHomepage) {
        return null;
    }
    
    switch(tier) {
        case TIERS.ADMIN:
            return '/pages/admin.html';
        case TIERS.GIRLFRIEND:
            return '/pages/girlfriend.html';
        case TIERS.FAMILY:
            return '/pages/family.html';
        case TIERS.AUTHENTICATED:
            return null;
        default:
            return null;
    }
}

// --- OPEN AUTH MODAL ---
function openAuthModal(e) {
    if (e) e.preventDefault();
    
    console.log('🔐 Opening authentication modal...');
    
    if (window.openAuthModal) {
        window.openAuthModal();
    } else {
        console.error('❌ Modal system not initialized');
    }
}

// --- SIGN OUT ---
async function handleSignOut(e) {
    if (e) e.preventDefault();
    
    try {
        await signOutUser();
        console.log('✅ User signed out');

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

// --- UPDATE UI ---
async function updateUI(user) {
    // Handle user-info element (contains photo, name, logout button)
    const userInfo = document.getElementById('user-info');
    const loginBtn = document.getElementById('login-btn');
    const userPhoto = document.getElementById('user-photo');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (user) {
        // User is logged in - Hide login button, show user info
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        
        // Update user details
        if (userPhoto && user.photoURL) {
            userPhoto.src = user.photoURL;
            userPhoto.style.display = 'block';
        }
        if (userName) {
            userName.textContent = user.displayName || user.email.split('@')[0];
            userName.style.display = 'block';
        }
        if (userEmail) {
            userEmail.textContent = user.email;
            userEmail.style.display = 'block';
        }
        
        // Initialize and apply tier
        await initializeUserTier(user);
        const userTier = await getUserTier();
        applyTierVisibility(userTier);
        
        console.log(`👤 Logged in as: ${user.email} (${userTier})`);
        
        // Terms manager will automatically check and show terms if needed
        // This happens through the termsManager.init() which watches auth state
        
    } else {
        // User is logged out - Show login button, hide user info
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (userInfo) userInfo.style.display = 'none';
        
        // Hide all tier-based content
        applyTierVisibility(TIERS.PUBLIC);
        
        // If on protected page, redirect to home
        if (isProtectedPage()) {
            console.log('🚫 Protected page requires authentication');
            const redirectPath = window.location.pathname.includes('/pages/') 
                ? '../index.html?action=signin' 
                : 'index.html?action=signin';
            window.location.href = redirectPath;
        }
    }
}

// --- SETUP EVENT LISTENERS ---
function setupEventListeners() {
    // Use event delegation to catch clicks on ALL sign-in/out buttons
    document.addEventListener('click', async (e) => {
        const target = e.target;
        
        // Check for sign-in buttons
        const isSignInButton = 
            target.id === 'login-btn' ||
            target.id === 'signInBtn' ||
            target.classList.contains('sign-in-btn') ||
            target.closest('#login-btn') ||
            target.closest('#signInBtn') ||
            target.closest('.sign-in-btn');
            
        if (isSignInButton) {
            e.preventDefault();
            console.log('🔐 Sign-in button clicked');
            openAuthModal(e);
        }
        
        // Check for sign-out buttons
        const isSignOutButton = 
            target.id === 'logout-btn' ||
            target.id === 'signOutLink' ||
            target.classList.contains('sign-out-link') ||
            target.classList.contains('sign-out-btn') ||
            target.closest('#logout-btn') ||
            target.closest('#signOutLink') ||
            target.closest('.sign-out-btn');
            
        if (isSignOutButton) {
            e.preventDefault();
            console.log('👋 Sign-out button clicked');
            await handleSignOut(e);
        }
    });
    
    console.log('✅ Event listeners attached with delegation');
}

// --- MOBILE MENU FUNCTIONALITY ---
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
                    
                    // Small delay to ensure terms check happens first
                    setTimeout(() => {
                        window.location.href = redirectPath;
                    }, 100);
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
        // Wait a bit for modal system to initialize
        setTimeout(() => {
            openAuthModal();
        }, 500);
    }
}

// --- INITIALIZE EVERYTHING ---
function initialize() {
    console.log('🚀 Auth-init starting...');
    
    // Initialize UI modal system FIRST
    initUI();
    
    // Terms manager initializes itself when imported
    console.log('📋 Terms manager initialized');
    
    // Setup event listeners
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
export { openAuthModal as handleSignIn, handleSignOut, initializeAuth };

// Make functions available globally for debugging
window.authFunctions = {
    openModal: openAuthModal,
    handleSignOut,
    getUserTier,
    getRedirectPath
};