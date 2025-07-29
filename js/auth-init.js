// js/auth-init.js - Authentication with Tier System (Updated for Firebase v12)
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

// --- SIGN IN ---
async function handleSignIn() {
    try {
        const user = await signInWithGoogle();
        if (user) {
            // Initialize user document with tier only if needed
            await initializeUserTier(user);
            await autoAssignTier(user);
            console.log('✅ User signed in & tier initialized:', user.email);
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

// --- SIGN OUT ---
async function handleSignOut() {
    try {
        await signOutUser();
        console.log('✅ User signed out');

        // Redirect if on a protected page
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
    }
}

// --- NAVIGATION BASED ON TIER ---
function showTierNavigation(tier) {
    document.querySelectorAll('.tier-nav').forEach(item => item.style.display = 'none');
    switch(tier) {
        case TIERS.ADMIN:
            document.querySelectorAll('.admin-nav').forEach(item => item.style.display = '');
        case TIERS.FAMILY:
            document.querySelectorAll('.family-nav').forEach(item => item.style.display = '');
        case TIERS.AUTHENTICATED:
            document.querySelectorAll('.auth-nav').forEach(item => item.style.display = '');
            break;
    }
}

function hideTierNavigation() {
    document.querySelectorAll('.tier-nav').forEach(item => item.style.display = 'none');
}

// --- INIT AUTH STATE ---
function initializeAuth() {
    onAuthStateChanged(auth, async (user) => {
        await updateUI(user);
        if (user) {
            // Ensure tier assignment only runs once per login
            await autoAssignTier(user);
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'signin') handleSignIn();
}

// --- EVENT LISTENERS ---
if (loginBtn) loginBtn.addEventListener('click', handleSignIn);
if (logoutBtn) logoutBtn.addEventListener('click', handleSignOut);

// Initialize on load
initializeAuth();
