// js/firebase/auth-tiers.js - Tier Management System
import { auth, db } from './config.js';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Tier levels
const TIERS = {
    PUBLIC: 'public',
    AUTHENTICATED: 'authenticated', 
    FAMILY: 'family',
    ADMIN: 'admin'
};

// Tier hierarchy (higher number = more access)
const TIER_LEVELS = {
    'public': 0,
    'authenticated': 1,
    'family': 2,
    'admin': 3
};

// Family member emails (all lowercase for consistent comparison)
const FAMILY_EMAILS = [
    // Girlfriend
    'raehaberbert@gmail.com',
    
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

// Admin email (make sure it's lowercase)
const ADMIN_EMAIL = 'chaceclaborn@gmail.com'.toLowerCase();

// Get current user's tier
export async function getUserTier(userId = null) {
    try {
        const uid = userId || auth.currentUser?.uid;
        if (!uid) return TIERS.PUBLIC;
        
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data().tier || TIERS.AUTHENTICATED;
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
    return TIER_LEVELS[userTier] >= TIER_LEVELS[requiredTier];
}

// Set user tier (admin only)
export async function setUserTier(targetUserId, newTier) {
    try {
        // Check if current user is admin
        const currentUserTier = await getUserTier();
        if (currentUserTier !== TIERS.ADMIN) {
            throw new Error('Only admins can change user tiers');
        }
        
        // Update target user's tier
        await updateDoc(doc(db, 'users', targetUserId), {
            tier: newTier,
            tierUpdatedAt: new Date(),
            tierUpdatedBy: auth.currentUser.uid
        });
        
        console.log(`Updated user ${targetUserId} to tier: ${newTier}`);
        return true;
    } catch (error) {
        console.error('Error setting user tier:', error);
        return false;
    }
}

// Initialize user document with tier
export async function initializeUserTier(user) {
    console.log('🔧 initializeUserTier called for:', user.email);
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            // Determine initial tier based on email
            let initialTier = TIERS.AUTHENTICATED;
            
            console.log('📧 Checking email:', user.email);
            console.log('🔑 Admin email:', ADMIN_EMAIL);
            console.log('👨‍👩‍👧‍👦 Family emails:', FAMILY_EMAILS);
            
            if (user.email.toLowerCase() === ADMIN_EMAIL) {
                initialTier = TIERS.ADMIN;
                console.log('✅ Email matches admin!');
            } else if (FAMILY_EMAILS.includes(user.email.toLowerCase())) {
                initialTier = TIERS.FAMILY;
                console.log('✅ Email matches family!');
            } else {
                console.log('ℹ️ Email doesn\'t match admin or family lists');
            }
            
            // First-time user setup
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL || null,
                tier: initialTier,
                createdAt: new Date(),
                lastLogin: new Date()
            });
            
            console.log(`New user ${user.email} initialized with tier: ${initialTier}`);
            console.log('User document created:', {
                email: user.email,
                tier: initialTier,
                isAdmin: user.email === ADMIN_EMAIL
            });
        } else {
            // Update last login
            await updateDoc(userRef, {
                lastLogin: new Date()
            });
            
            // Auto-upgrade if email matches family/admin list
            await autoAssignTier(user);
        }
    } catch (error) {
        console.error('Error initializing user tier:', error);
    }
}

// Get all users with their tiers (admin only)
export async function getAllUsers() {
    try {
        const currentUserTier = await getUserTier();
        if (currentUserTier !== TIERS.ADMIN) {
            throw new Error('Only admins can view all users');
        }
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        
        usersSnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by tier level (admins first) then by email
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

// Show/hide elements based on tier
export async function applyTierVisibility() {
    const userTier = await getUserTier();
    const tierLevel = TIER_LEVELS[userTier];
    
    // Hide all tier-restricted elements first
    document.querySelectorAll('[data-tier]').forEach(element => {
        element.style.display = 'none';
    });
    
    // Show elements user has access to
    Object.entries(TIER_LEVELS).forEach(([tier, level]) => {
        if (tierLevel >= level) {
            document.querySelectorAll(`[data-tier="${tier}"]`).forEach(element => {
                element.style.display = '';
            });
        }
    });
    
    // Add tier class to body
    document.body.className = `tier-${userTier}`;
}

// Protect entire pages by tier
export async function protectPage(requiredTier) {
    const hasAccess = await hasMinimumTier(requiredTier);
    
    if (!hasAccess) {
        // Show access denied message or redirect
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                <h1>Access Denied</h1>
                <p>You don't have permission to view this page.</p>
                <p>Required tier: <strong>${requiredTier}</strong></p>
                <a href="../index.html" style="color: #4CAF50; text-decoration: none;">Return to Home</a>
            </div>
        `;
    }
    
    return hasAccess;
}

// Auto-assign tiers based on email
export async function autoAssignTier(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const currentTier = userDoc.data().tier;
            let newTier = TIERS.AUTHENTICATED;
            
            // Check if user should have higher tier
            if (user.email.toLowerCase() === ADMIN_EMAIL) {
                newTier = TIERS.ADMIN;
            } else if (FAMILY_EMAILS.includes(user.email.toLowerCase())) {
                newTier = TIERS.FAMILY;
            }
            
            // Only update if they should have a higher tier
            if (TIER_LEVELS[newTier] > TIER_LEVELS[currentTier]) {
                await updateDoc(userRef, { 
                    tier: newTier,
                    tierAutoUpgraded: true,
                    tierUpgradedAt: new Date()
                });
                console.log(`Auto-upgraded ${user.email} from ${currentTier} to ${newTier}`);
            }
        }
    } catch (error) {
        console.error('Error auto-assigning tier:', error);
    }
}

// Export tier constants for use in other files
export { TIERS, TIER_LEVELS };