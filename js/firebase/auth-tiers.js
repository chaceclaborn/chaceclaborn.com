// js/firebase/auth-tiers.js - Complete Secure Tier Management System with Admin Override
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
    'girlfriend': 'Raeha',
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
        
        // ADMIN OVERRIDE: Always return admin for admin email
        if (auth.currentUser?.email?.toLowerCase() === 'chaceclaborn@gmail.com') {
            console.log('👑 Admin override - returning admin tier');
            return TIERS.ADMIN;
        }
        
        // GIRLFRIEND OVERRIDE: Always return girlfriend for Raeha's email
        if (auth.currentUser?.email?.toLowerCase() === 'raehaberbert@gmail.com') {
            console.log('💝 Girlfriend override - returning girlfriend tier');
            return TIERS.GIRLFRIEND;
        }
        
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

// Check if user has minimum required tier (WITH ADMIN OVERRIDE)
export async function hasMinimumTier(requiredTier) {
    const userTier = await getUserTier();
    
    // ADMIN OVERRIDE: Admin has access to everything
    if (userTier === TIERS.ADMIN) {
        await logPageAccess(requiredTier, true);
        return true;
    }
    
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
            updatedBy: auth.currentUser.email
        });
        
        console.log(`✅ User tier updated to ${newTier}`);
        return true;
    } catch (error) {
        console.error('Error setting user tier:', error);
        return false;
    }
}

// Check user's tier from email (for initial assignment)
export function checkUserTier(email) {
    const normalizedEmail = email?.toLowerCase();
    
    if (!normalizedEmail) return TIERS.AUTHENTICATED;
    
    // Check tiers in order of priority
    if (normalizedEmail === ADMIN_EMAIL) return TIERS.ADMIN;
    if (GIRLFRIEND_EMAILS.includes(normalizedEmail)) return TIERS.GIRLFRIEND;
    if (FAMILY_EMAILS.includes(normalizedEmail)) return TIERS.FAMILY;
    
    return TIERS.AUTHENTICATED;
}

// Initialize user document with tier
export async function initializeUserTier(user) {
    if (!user) return;
    
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            // New user - create document
            const tier = checkUserTier(user.email);
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                tier: tier,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });
            console.log(`✅ New user initialized with tier: ${tier}`);
        } else {
            // Existing user - update last login
            await updateDoc(userRef, {
                lastLogin: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error initializing user tier:', error);
    }
}

// Auto-assign tier based on email (for existing users)
export async function autoAssignTier(user) {
    if (!user) return;
    
    try {
        const expectedTier = checkUserTier(user.email);
        const currentTier = await getUserTier(user.uid);
        
        // Only update if tier doesn't match expected
        if (currentTier !== expectedTier) {
            // Don't downgrade admin users
            if (currentTier === TIERS.ADMIN) {
                console.log('⚠️ Admin tier protected from auto-assignment');
                return;
            }
            
            await updateDoc(doc(db, 'users', user.uid), {
                tier: expectedTier,
                tierAutoAssigned: true,
                tierAssignedAt: serverTimestamp()
            });
            console.log(`✅ Tier auto-assigned: ${expectedTier}`);
        }
    } catch (error) {
        console.error('Error auto-assigning tier:', error);
    }
}

// Apply tier-based visibility to the page (WITH ADMIN OVERRIDE)
export async function applyTierVisibility(userTier = null) {
    const tier = userTier || await getUserTier();
    
    // Update body class for CSS rules
    document.body.className = document.body.className.replace(/tier-\w+/g, '');
    document.body.classList.add(`tier-${tier}`);
    
    // ADMIN OVERRIDE: Show all navigation items for admin
    if (tier === TIERS.ADMIN) {
        // Show ALL tier navigation items
        document.querySelectorAll('.tier-nav').forEach(nav => {
            nav.style.display = '';
            nav.style.visibility = 'visible';
        });
        
        // Update tier indicator
        const tierIndicator = document.getElementById('user-tier-indicator');
        if (tierIndicator) {
            tierIndicator.textContent = 'Admin (Full Access)';
            tierIndicator.className = `user-tier-indicator tier-${tier}`;
        }
        
        console.log('👑 Admin: All navigation items visible');
        return;
    }
    
    // For non-admin users, show/hide based on tier hierarchy
    const visibleTiers = [];
    const tierLevel = TIER_LEVELS[tier];
    
    for (const [tierName, level] of Object.entries(TIER_LEVELS)) {
        if (level <= tierLevel) {
            visibleTiers.push(tierName);
        }
    }
    
    // Show/hide tier-specific navigation
    document.querySelectorAll('.tier-nav').forEach(nav => {
        const navTier = Array.from(nav.classList).find(c => c.endsWith('-nav'))?.replace('-nav', '');
        if (navTier && visibleTiers.includes(navTier.replace('auth', 'authenticated'))) {
            nav.style.display = '';
            nav.style.visibility = 'visible';
        } else {
            nav.style.display = 'none';
            nav.style.visibility = 'hidden';
        }
    });
    
    // Update tier indicator
    const tierIndicator = document.getElementById('user-tier-indicator');
    if (tierIndicator) {
        tierIndicator.textContent = TIER_NAMES[tier] || tier;
        tierIndicator.className = `user-tier-indicator tier-${tier}`;
    }
}

// Protect page based on required tier (WITH ADMIN OVERRIDE)
export async function protectPage(requiredTier, pageName = 'this page') {
    try {
        const hasAccess = await hasMinimumTier(requiredTier);
        
        if (!hasAccess) {
            // Check if user is signed in
            if (!auth.currentUser) {
                console.log('❌ Not signed in - redirecting to login');
                window.location.href = '../index.html?action=signin';
                return false;
            }
            
            // User is signed in but lacks required tier
            const userTier = await getUserTier();
            console.log(`❌ Access denied: User tier (${userTier}) < Required tier (${requiredTier})`);
            
            // Show access denied message
            document.body.innerHTML = `
                <div class="access-denied">
                    <div class="access-denied-content">
                        <div class="access-denied-icon">🔒</div>
                        <h1>Access Restricted</h1>
                        <p>This content requires <span class="access-denied-tier">${TIER_NAMES[requiredTier]}</span> access.</p>
                        <p>Your current tier: <span class="tier-badge tier-${userTier}">${TIER_NAMES[userTier]}</span></p>
                        <a href="../index.html" class="access-denied-button">Return Home</a>
                    </div>
                </div>
            `;
            return false;
        }
        
        console.log(`✅ Access granted to ${pageName}`);
        return true;
    } catch (error) {
        console.error('Error protecting page:', error);
        window.location.href = '../index.html';
        return false;
    }
}

// Subscribe to user tier changes
export function subscribeTierChanges(userId, callback) {
    if (!userId) return null;
    
    return onSnapshot(doc(db, 'users', userId), (doc) => {
        if (doc.exists()) {
            const tier = doc.data().tier;
            callback(tier);
            applyTierVisibility(tier);
        }
    });
}

// Check if current user is admin
export async function isAdmin() {
    const tier = await getUserTier();
    return tier === TIERS.ADMIN;
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