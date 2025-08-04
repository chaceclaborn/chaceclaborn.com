// js/components/navigation.js - Centralized Navigation Component with Consistent Display
import { auth } from '../firebase/config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { getUserTier, TIERS } from '../firebase/auth-tiers.js';

class NavigationComponent {
    constructor() {
        console.log('🚀 Navigation Component Initializing...');
        this.currentUser = null;
        this.currentTier = TIERS.PUBLIC;
        this.currentPage = this.getCurrentPage();
        this.isInitialized = false;
        this.authChecked = false; // Track if auth has been checked
        
        // Define navigation structure - Single source of truth!
        this.navItems = {
            public: [
                { href: 'index.html', text: 'Home', id: 'home' },
                { href: 'pages/portfolio.html', text: 'Portfolio', id: 'portfolio' },
                { href: 'pages/resume.html', text: 'Resume', id: 'resume' }
            ],
            authenticated: [
                { href: 'pages/dashboard.html', text: 'Dashboard', id: 'dashboard', tier: TIERS.AUTHENTICATED, class: 'tier-nav auth-nav' }
            ],
            family: [
                { href: 'pages/family.html', text: 'Family', id: 'family', tier: TIERS.FAMILY, class: 'tier-nav family-nav' }
            ],
            girlfriend: [
                { href: 'pages/girlfriend.html', text: "Raeha's Tab", id: 'girlfriend', tier: TIERS.GIRLFRIEND, class: 'tier-nav girlfriend-nav' }
            ],
            admin: [
                { href: 'pages/admin.html', text: 'Admin', id: 'admin', tier: TIERS.ADMIN, class: 'tier-nav admin-nav' }
            ]
        };
        
        this.init();
    }
    
    init() {
        // Initialize immediately if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    initialize() {
        console.log('📍 Current page:', this.currentPage);
        console.log('📁 Current path:', window.location.pathname);
        
        // Build initial navigation (public view only)
        this.buildNavigation();
        
        // Setup authentication listener
        onAuthStateChanged(auth, async (user) => {
            console.log('👤 Auth state changed:', user ? user.email : 'Not signed in');
            this.currentUser = user;
            this.authChecked = true;
            
            if (user) {
                // Get user's tier
                this.currentTier = await getUserTier();
                console.log('🎯 User tier:', this.currentTier);
                
                // Special check for admin
                if (user.email?.toLowerCase() === 'chaceclaborn@gmail.com') {
                    this.currentTier = TIERS.ADMIN; // Force admin tier
                    console.log('👑 Admin detected - forcing admin tier');
                }
                
                // Check for girlfriend
                if (user.email?.toLowerCase() === 'raehaberbert@gmail.com') {
                    this.currentTier = TIERS.GIRLFRIEND;
                    console.log('💝 Raeha detected - setting girlfriend tier');
                }
                
                // SET BODY CLASS - THIS IS CRITICAL!
                document.body.className = document.body.className.replace(/tier-\w+/g, '');
                document.body.classList.add(`tier-${this.currentTier}`);
                console.log('📝 Body class set to:', `tier-${this.currentTier}`);
                
            } else {
                this.currentTier = TIERS.PUBLIC;
                
                // Set body class for public
                document.body.className = document.body.className.replace(/tier-\w+/g, '');
                document.body.classList.add('tier-public');
            }
            
            // ALWAYS rebuild navigation after auth is determined
            console.log('🔨 Rebuilding navigation for tier:', this.currentTier);
            this.buildNavigation();
            
            // Force visibility update for tier navigation
            this.forceNavigationVisibility();
        });
        
        this.isInitialized = true;
        console.log('✅ Navigation Component Ready');
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        return page.replace('.html', '');
    }
    
    buildNavigation() {
        const navContainer = document.getElementById('mainNav');
        if (!navContainer) {
            console.warn('⚠️ Navigation container #mainNav not found');
            return;
        }
        
        console.log('🔧 Building navigation for tier:', this.currentTier);
        
        // Clear existing navigation
        navContainer.innerHTML = '';
        
        // ALWAYS add public navigation items
        this.navItems.public.forEach(item => {
            navContainer.appendChild(this.createNavLink(item));
        });
        
        // Add tier-based navigation if user is signed in
        if (this.currentUser && this.authChecked) {
            this.addTierNavigation(navContainer);
        }
        
        console.log('✅ Navigation built with', navContainer.children.length, 'items');
    }
    
    addTierNavigation(container) {
        if (!this.currentUser) {
            console.log('❌ No user, skipping tier navigation');
            return;
        }
        
        console.log('🔐 Adding tier navigation for:', this.currentTier);
        
        // Build list of tiers to show based on user's tier
        let visibleTiers = [];
        
        switch (this.currentTier) {
            case TIERS.ADMIN:
                // Admin sees everything
                visibleTiers = ['authenticated', 'family', 'girlfriend', 'admin'];
                console.log('👑 Admin: showing all tiers');
                break;
                
            case TIERS.GIRLFRIEND:
                // Girlfriend sees authenticated, family, and girlfriend tabs
                visibleTiers = ['authenticated', 'family', 'girlfriend'];
                console.log('💝 Girlfriend: showing auth, family, girlfriend');
                break;
                
            case TIERS.FAMILY:
                // Family sees authenticated and family tabs
                visibleTiers = ['authenticated', 'family'];
                console.log('👨‍👩‍👧‍👦 Family: showing auth, family');
                break;
                
            case TIERS.AUTHENTICATED:
                // Authenticated users only see dashboard
                visibleTiers = ['authenticated'];
                console.log('✅ Authenticated: showing dashboard only');
                break;
                
            default:
                console.log('❓ Unknown tier:', this.currentTier);
                return;
        }
        
        // Add the navigation items for visible tiers
        visibleTiers.forEach(tierKey => {
            if (this.navItems[tierKey]) {
                this.navItems[tierKey].forEach(item => {
                    const link = this.createNavLink(item);
                    container.appendChild(link);
                    console.log('➕ Added:', item.text);
                });
            }
        });
    }
    
    createNavLink(item) {
        const link = document.createElement('a');
        
        // Determine the correct path based on current location
        let href = item.href;
        const isInPagesDir = window.location.pathname.includes('/pages/');
        const isInRoot = !isInPagesDir;
        
        // Adjust paths based on current directory
        if (isInPagesDir) {
            // We're in /pages/ directory
            if (item.href === 'index.html') {
                href = '../index.html';
            } else if (item.href.startsWith('pages/')) {
                // Remove 'pages/' prefix since we're already in pages directory
                href = item.href.replace('pages/', '');
            }
        } else {
            // We're in root directory - paths stay as defined
            href = item.href;
        }
        
        link.href = href;
        link.textContent = item.text;
        link.className = 'nav-link';
        
        // Add tier-specific classes
        if (item.class) {
            link.className += ' ' + item.class;
        }
        
        // Mark current page as active
        if (this.isCurrentPage(item.id)) {
            link.className += ' active';
        }
        
        return link;
    }
    
    isCurrentPage(itemId) {
        // Check if this nav item matches the current page
        const currentPage = this.currentPage;
        
        // Handle special cases
        if (currentPage === '' || currentPage === 'index') {
            return itemId === 'home';
        }
        
        return currentPage === itemId;
    }
    
    forceNavigationVisibility() {
        // Force all tier navigation to be visible based on current tier
        console.log('🔧 Forcing navigation visibility for tier:', this.currentTier);
        
        if (this.currentTier === TIERS.ADMIN) {
            // Admin sees everything
            document.querySelectorAll('.tier-nav').forEach(el => {
                el.style.display = 'inline-block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            });
        } else if (this.currentTier === TIERS.GIRLFRIEND) {
            // Girlfriend sees auth, family, girlfriend
            document.querySelectorAll('.auth-nav, .family-nav, .girlfriend-nav').forEach(el => {
                el.style.display = 'inline-block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            });
            document.querySelectorAll('.admin-nav').forEach(el => {
                el.style.display = 'none';
            });
        } else if (this.currentTier === TIERS.FAMILY) {
            // Family sees auth, family
            document.querySelectorAll('.auth-nav, .family-nav').forEach(el => {
                el.style.display = 'inline-block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            });
            document.querySelectorAll('.girlfriend-nav, .admin-nav').forEach(el => {
                el.style.display = 'none';
            });
        } else if (this.currentTier === TIERS.AUTHENTICATED) {
            // Authenticated sees only dashboard
            document.querySelectorAll('.auth-nav').forEach(el => {
                el.style.display = 'inline-block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            });
            document.querySelectorAll('.family-nav, .girlfriend-nav, .admin-nav').forEach(el => {
                el.style.display = 'none';
            });
        }
    }
}

// Initialize navigation when module loads
const navigation = new NavigationComponent();

// Export for use in other modules if needed
export default navigation;

// Make available globally for debugging
window.navigationComponent = navigation;

// Add helper function for debugging
window.debugNavigation = function() {
    console.log('=== Navigation Debug ===');
    console.log('Current User:', navigation.currentUser?.email);
    console.log('Current Tier:', navigation.currentTier);
    console.log('Current Page:', navigation.currentPage);
    console.log('Auth Checked:', navigation.authChecked);
    console.log('Nav Container:', document.getElementById('mainNav'));
    console.log('Nav Items:', document.querySelectorAll('#mainNav .nav-link'));
};