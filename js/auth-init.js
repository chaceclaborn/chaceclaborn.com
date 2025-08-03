// js/auth-init.js - Authentication with Smart Auto-Redirect by Tier
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
            
            // Auto-redirect to appropriate dashboard
            const redirectPath = getRedirectPath(userTier);
            if (redirectPath) {
                console.log(`🚀 Redirecting ${userTier} user to: ${redirectPath}`);
                
                // Show a nice message before redirect
                if (userTier === TIERS.ADMIN) {
                    showWelcomeMessage('Welcome Admin! Redirecting to your dashboard...', 'admin');
                } else if (userTier === TIERS.GIRLFRIEND) {
                    showWelcomeMessage('Welcome Raeha! Taking you to your special page... 💕', 'girlfriend');
                } else if (userTier === TIERS.FAMILY) {
                    showWelcomeMessage('Welcome family member! Redirecting to family area...', 'family');
                }
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = redirectPath;
                }, 1500);
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

// --- WELCOME MESSAGE ---
function showWelcomeMessage(message, tierType) {
    // Remove any existing welcome message
    const existing = document.getElementById('welcome-message');
    if (existing) existing.remove();
    
    // Create welcome message
    const welcomeDiv = document.createElement('div');
    welcomeDiv.id = 'welcome-message';
    welcomeDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${tierType === 'admin' ? '#c62828' : 
                      tierType === 'girlfriend' ? '#d63384' : 
                      tierType === 'family' ? '#7b1fa2' : '#617140'};
        color: white;
        padding: 30px 50px;
        border-radius: 20px;
        font-size: 1.2rem;
        font-weight: 600;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        animation: fadeIn 0.5s ease;
    `;
    welcomeDiv.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(welcomeDiv);
}

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
        
        // Add "Go to My Dashboard" button for tier users
        if (tier !== TIERS.AUTHENTICATED && tier !== TIERS.PUBLIC) {
            addDashboardButton(tier);
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
        await applyTierVisibility();
        hideTierNavigation();
        document.body.className = 'tier-public';
        
        // Remove any tier-specific features
        removeAdminFeatures();
        removeDashboardButton();
    }
}

// --- DASHBOARD BUTTON ---
function addDashboardButton(tier) {
    // Don't add if already on a tier page
    if (window.location.pathname.includes('/pages/')) return;
    
    // Remove existing button if any
    removeDashboardButton();
    
    const dashboardBtn = document.createElement('div');
    dashboardBtn.id = 'dashboard-quick-access';
    
    const buttonConfig = {
        [TIERS.ADMIN]: {
            text: '🔐 Admin Dashboard',
            href: '/pages/admin.html',
            color: '#c62828'
        },
        [TIERS.GIRLFRIEND]: {
            text: '💕 My Special Page',
            href: '/pages/girlfriend.html',
            color: '#d63384'
        },
        [TIERS.FAMILY]: {
            text: '👨‍👩‍👧‍👦 Family Area',
            href: '/pages/family.html',
            color: '#7b1fa2'
        }
    };
    
    const config = buttonConfig[tier];
    if (!config) return;
    
    dashboardBtn.innerHTML = `
        <a href="${config.href}" style="
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            text-decoration: none;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            font-weight: 600;
            z-index: 1000;
            transition: all 0.3s;
            font-size: 0.95rem;
        " onmouseover="this.style.transform='translateY(-2px) scale(1.05)'" 
          onmouseout="this.style.transform='translateY(0) scale(1)'">
            ${config.text}
        </a>
    `;
    
    document.body.appendChild(dashboardBtn);
}

function removeDashboardButton() {
    const btn = document.getElementById('dashboard-quick-access');
    if (btn) btn.remove();
}

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
    // Admin features are handled by addDashboardButton now
}

function removeAdminFeatures() {
    // Handled by removeDashboardButton
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
                    
                    // Show welcome message
                    if (userTier === TIERS.GIRLFRIEND) {
                        showWelcomeMessage('Welcome back Raeha! 💕', 'girlfriend');
                    } else if (userTier === TIERS.FAMILY) {
                        showWelcomeMessage('Welcome back family member!', 'family');
                    } else if (userTier === TIERS.ADMIN) {
                        showWelcomeMessage('Welcome back Admin!', 'admin');
                    }
                    
                    setTimeout(() => {
                        window.location.href = redirectPath;
                    }, 1000);
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