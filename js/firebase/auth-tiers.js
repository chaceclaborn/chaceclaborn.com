// js/firebase/auth-tiers.js - Complete Secure Tier Management System
import { auth, db } from './config.js';
import { 
  doc, setDoc, getDoc, updateDoc, addDoc, collection, query, where, orderBy, limit, getDocs, onSnapshot, serverTimestamp, increment, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Tier levels - DO NOT MODIFY CLIENT-SIDE
const TIERS = {
    PUBLIC: 'public',
    AUTHENTICATED: 'authenticated', 
    FAMILY: 'family',
    GIRLFRIEND: 'girlfriend',
    ADMIN: 'admin'
};

// Tier hierarchy (higher number = more access)
const TIER_LEVELS = {
    'public': 0,
    'authenticated': 1,
    'family': 2,
    'girlfriend': 3,
    'admin': 4
};

// Tier display names
const TIER_NAMES = {
    'public': 'Public',
    'authenticated': 'Member',
    'family': 'Family',
    'girlfriend': 'Special',
    'admin': 'Administrator'
};

// Email lists - These are duplicated in Firebase rules for security
// Changes here must also be made in Firebase Security Rules
const GIRLFRIEND_EMAILS = [
    'raehaberbert@gmail.com'
].map(email => email.toLowerCase());

const FAMILY_EMAILS = [
    // Dad
    'pbclaborn@bellsouth.net',
    'patrick@whitefab.com',
    'patrickclaborn@gmail.com',
    
    // Mom
    'reivar@bellsouth.net',
    'reiva.claborn@vulc.com',
    
    // Popeye/Grandad
    'edwardrich43@gmail.com',
    
    // Mymy
    'sondrarich@bellsouth.net',
    'sondraarichardson@icloud.com'
].map(email => email.toLowerCase());

// Admin email
const ADMIN_EMAIL = 'chaceclaborn@gmail.com'.toLowerCase();

// Log page access attempts for security monitoring
async function logPageAccess(page, allowed) {
    try {
        if (!auth.currentUser) return;
        
        await addDoc(collection(db, 'access_logs'), {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
            page: page,
            timestamp: serverTimestamp(),
            allowed: allowed,
            userAgent: navigator.userAgent,
            referrer: document.referrer
        });
    } catch (error) {
        console.error('Error logging access:', error);
    }
}

// Get current user's tier from Firestore (server-side truth)
export async function getUserTier(userId = null) {
    try {
        const uid = userId || auth.currentUser?.uid;
        if (!uid) return TIERS.PUBLIC;
        
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            const tier = userDoc.data().tier;
            // Validate tier exists in our system
            if (TIER_LEVELS.hasOwnProperty(tier)) {
                return tier;
            }
        }
        return TIERS.AUTHENTICATED;
    } catch (error) {
        console.error('Error getting user tier:', error);
        return TIERS.PUBLIC;
    }
}

// Check if user has minimum required tier
export async function hasMinimumTier(requiredTier) {
    const userTier = await getUserTier();
    const hasAccess = TIER_LEVELS[userTier] >= TIER_LEVELS[requiredTier];
    
    // Log the access attempt
    await logPageAccess(requiredTier, hasAccess);
    
    return hasAccess;
}

// Set user tier (admin only) - Server validates this
export async function setUserTier(targetUserId, newTier) {
    try {
        // Check if current user is admin
        const currentUserTier = await getUserTier();
        if (currentUserTier !== TIERS.ADMIN) {
            console.error('Unauthorized: Only admins can change user tiers');
            return false;
        }
        
        // Validate new tier
        if (!TIER_LEVELS.hasOwnProperty(newTier)) {
            console.error('Invalid tier specified');
            return false;
        }
        
        // Update target user's tier
        await updateDoc(doc(db, 'users', targetUserId), {
            tier: newTier,
            tierUpdatedAt: serverTimestamp(),
            tierUpdatedBy: auth.currentUser.uid
        });
        
        console.log(`Updated user ${targetUserId} to tier: ${newTier}`);
        return true;
    } catch (error) {
        console.error('Error setting user tier:', error);
        return false;
    }
}

// Determine tier based on email (for initial setup only)
function determineTierByEmail(email) {
    const lowerEmail = email.toLowerCase();
    
    if (lowerEmail === ADMIN_EMAIL) {
        return TIERS.ADMIN;
    } else if (GIRLFRIEND_EMAILS.includes(lowerEmail)) {
        return TIERS.GIRLFRIEND;
    } else if (FAMILY_EMAILS.includes(lowerEmail)) {
        return TIERS.FAMILY;
    } else {
        return TIERS.AUTHENTICATED;
    }
}

// Initialize user document with tier
export async function initializeUserTier(user) {
    console.log('🔧 Initializing user tier for:', user.email);
    
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            // Determine initial tier based on email
            const initialTier = determineTierByEmail(user.email);
            
            // Create user document
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL || null,
                tier: initialTier,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                loginCount: 1,
                emailVerified: user.emailVerified || false
            });
            
            console.log(`✅ New user ${user.email} initialized with tier: ${initialTier}`);
        } else {
            // Update last login
            await updateDoc(userRef, {
                lastLogin: serverTimestamp(),
                loginCount: increment(1),
                emailVerified: user.emailVerified || false
            });
            
            // Auto-upgrade tier if email matches higher tier
            await autoAssignTier(user);
        }
    } catch (error) {
        console.error('Error initializing user tier:', error);
        throw error; // Re-throw to handle in calling function
    }
}

// Auto-assign tiers based on email (for upgrades only)
export async function autoAssignTier(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const currentTier = userDoc.data().tier;
            const emailTier = determineTierByEmail(user.email);
            
            // Only upgrade, never downgrade
            if (TIER_LEVELS[emailTier] > TIER_LEVELS[currentTier]) {
                await updateDoc(userRef, { 
                    tier: emailTier,
                    tierAutoUpgraded: true,
                    tierUpgradedAt: serverTimestamp()
                });
                console.log(`✅ Auto-upgraded ${user.email} from ${currentTier} to ${emailTier}`);
            }
        }
    } catch (error) {
        console.error('Error auto-assigning tier:', error);
    }
}

// Apply tier-based visibility to UI elements
export async function applyTierVisibility() {
    const userTier = await getUserTier();
    const tierLevel = TIER_LEVELS[userTier];
    
    console.log(`🔐 Applying visibility for tier: ${userTier} (level ${tierLevel})`);
    
    // Hide all tier-restricted elements first
    document.querySelectorAll('[data-tier]').forEach(element => {
        element.style.display = 'none';
        element.setAttribute('aria-hidden', 'true');
    });
    
    // Show elements user has access to
    Object.entries(TIER_LEVELS).forEach(([tier, level]) => {
        if (tierLevel >= level) {
            document.querySelectorAll(`[data-tier="${tier}"]`).forEach(element => {
                element.style.display = '';
                element.removeAttribute('aria-hidden');
            });
        }
    });
    
    // Apply tier-specific classes to body
    document.body.className = document.body.className.replace(/tier-\w+/g, '');
    document.body.classList.add(`tier-${userTier}`);
    
    // Update tier indicator if exists
    const tierIndicator = document.getElementById('user-tier-indicator');
    if (tierIndicator) {
        tierIndicator.textContent = TIER_NAMES[userTier];
        tierIndicator.className = `tier-badge tier-${userTier}`;
    }
}

// Protect entire pages by tier with secure redirect
export async function protectPage(requiredTier, pageName = '') {
    const hasAccess = await hasMinimumTier(requiredTier);
    
    if (!hasAccess) {
        // Log unauthorized access attempt
        console.warn(`⚠️ Unauthorized access attempt to ${pageName || requiredTier} page`);
        
        // Clear any sensitive content immediately
        document.body.style.display = 'none';
        
        // Show access denied message
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                background: #f5f5f5;
            ">
                <div style="
                    text-align: center;
                    padding: 40px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 400px;
                ">
                    <h1 style="color: #d32f2f; margin-bottom: 20px;">
                        🔒 Access Denied
                    </h1>
                    <p style="color: #666; margin-bottom: 10px;">
                        You don't have permission to view this page.
                    </p>
                    <p style="color: #999; font-size: 14px; margin-bottom: 30px;">
                        Required access level: <strong>${TIER_NAMES[requiredTier]}</strong>
                    </p>
                    <a href="../index.html" style="
                        display: inline-block;
                        padding: 12px 24px;
                        background: #617140;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        transition: background 0.3s;
                    " onmouseover="this.style.background='#4a5a30'"
                       onmouseout="this.style.background='#617140'">
                        Return to Home
                    </a>
                </div>
            </div>
        `;
        
        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 3000);
        
        document.body.style.display = 'block';
    }
    
    return hasAccess;
}

// Get all users with their tiers (admin only)
export async function getAllUsers() {
    try {
        const currentUserTier = await getUserTier();
        if (currentUserTier !== TIERS.ADMIN) {
            throw new Error('Unauthorized: Admin access required');
        }
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            users.push({
                id: doc.id,
                ...userData,
                tierName: TIER_NAMES[userData.tier] || 'Unknown'
            });
        });
        
        // Sort by tier level (highest first) then by email
        users.sort((a, b) => {
            const tierDiff = TIER_LEVELS[b.tier] - TIER_LEVELS[a.tier];
            if (tierDiff !== 0) return tierDiff;
            return a.email.localeCompare(b.email);
        });
        
        return users;
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
}

// Get tier statistics (admin only)
export async function getTierStats() {
    try {
        const currentUserTier = await getUserTier();
        if (currentUserTier !== TIERS.ADMIN) {
            throw new Error('Unauthorized: Admin access required');
        }
        
        const users = await getAllUsers();
        const stats = {
            total: users.length,
            byTier: {}
        };
        
        // Initialize counts
        Object.keys(TIERS).forEach(tier => {
            stats.byTier[TIERS[tier]] = 0;
        });
        
        // Count users by tier
        users.forEach(user => {
            if (stats.byTier.hasOwnProperty(user.tier)) {
                stats.byTier[user.tier]++;
            }
        });
        
        return stats;
    } catch (error) {
        console.error('Error getting tier stats:', error);
        return null;
    }
}

// Export constants and functions
export { TIERS, TIER_LEVELS, TIER_NAMES };