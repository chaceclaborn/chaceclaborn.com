// js/components/navigation.js - Fixed for Vite development server
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
        this.authChecked = false;
        this.isViteDevServer = this.checkIfViteDevServer();
        
        // Define navigation structure
        this.navItems = {
            public: [
                { href: 'index.html', text: 'Home', id: 'home' },
                { href: 'pages/portfolio.html', text: 'Portfolio', id: 'portfolio' },
                { href: 'pages/resume.html', text: 'Resume', id: 'resume' }
            ],
            authenticated: [],
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
    
    checkIfViteDevServer() {
        // Check if we're running on Vite dev server
        return window.location.port === '3000' || 
               window.location.port === '5173' || 
               import.meta.env?.DEV === true;
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    initialize() {
        console.log('📍 Current page:', this.currentPage);
        console.log('📁 Current path:', window.location.pathname);
        console.log('🚀 Vite Dev Server:', this.isViteDevServer);
        
        // Build initial navigation (public view)
        this.buildNavigation();
        
        // Setup authentication listener - ONLY ONE
        this.authUnsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('👤 Auth state changed:', user ? user.email : 'null');
            
            // Prevent multiple rebuilds
            if (this.currentUser?.uid === user?.uid && this.authChecked) {
                console.log('⏭️ Same auth state, skipping rebuild');
                return;
            }
            
            this.currentUser = user;
            this.authChecked = true;
            
            if (user) {
                const tier = await getUserTier();
                console.log('🎯 User tier determined:', tier);
                this.currentTier = tier;
                
                // Set body class
                document.body.className = document.body.className.replace(/tier-\w+/g, '');
                document.body.classList.add(`tier-${this.currentTier}`);
            } else {
                this.currentTier = TIERS.PUBLIC;
                document.body.className = document.body.className.replace(/tier-\w+/g, '');
                document.body.classList.add('tier-public');
            }
            
            // Rebuild navigation once
            console.log('🔨 Rebuilding navigation for tier:', this.currentTier);
            this.buildNavigation();
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
                visibleTiers = ['authenticated', 'family', 'girlfriend', 'admin'];
                console.log('👑 Admin: showing all tiers');
                break;
                
            case TIERS.GIRLFRIEND:
                visibleTiers = ['authenticated', 'family', 'girlfriend'];
                console.log('💝 Girlfriend: showing auth, family, girlfriend');
                break;
                
            case TIERS.FAMILY:
                visibleTiers = ['authenticated', 'family'];
                console.log('👨‍👩‍👧‍👦 Family: showing auth, family');
                break;
                
            case TIERS.AUTHENTICATED:
                visibleTiers = ['authenticated'];
                console.log('✅ Authenticated: basic member access');
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
        
        // Build the correct path
        let href = item.href;
        
        if (this.isViteDevServer) {
            // For Vite dev server, use absolute paths
            if (href === 'index.html') {
                href = '/';
            } else if (href.startsWith('pages/')) {
                href = '/' + href;
            }
        } else {
            // For production or regular serving
            const isOnIndexPage = window.location.pathname === '/' || 
                                  window.location.pathname.endsWith('/index.html') ||
                                  window.location.pathname.endsWith('/frontend/') ||
                                  window.location.pathname.endsWith('/frontend/index.html');
            
            if (isOnIndexPage) {
                // We're on index page, use relative paths
                if (href === 'index.html') {
                    href = './index.html';
                }
                // pages/ paths are already correct
            } else {
                // We're in a subfolder (pages/), adjust paths
                if (href === 'index.html') {
                    href = '../index.html';
                } else if (href.startsWith('pages/')) {
                    href = href.replace('pages/', './');
                }
            }
        }
        
        link.href = href;
        link.className = 'nav-link';
        if (item.class) {
            link.className += ' ' + item.class;
        }
        
        // Mark active page
        if (item.id === this.currentPage || 
            (item.id === 'home' && (this.currentPage === 'index' || this.currentPage === ''))) {
            link.classList.add('active');
        }
        
        link.textContent = item.text;
        
        // Set display based on tier visibility
        if (item.tier) {
            link.style.display = this.shouldShowForTier(item.tier) ? '' : 'none';
        }
        
        return link;
    }
    
    shouldShowForTier(itemTier) {
        if (!this.currentUser) return false;
        
        switch (this.currentTier) {
            case TIERS.ADMIN:
                return true; // Admin sees everything
            case TIERS.GIRLFRIEND:
                return itemTier === TIERS.FAMILY || 
                       itemTier === TIERS.GIRLFRIEND || 
                       itemTier === TIERS.AUTHENTICATED;
            case TIERS.FAMILY:
                return itemTier === TIERS.FAMILY || 
                       itemTier === TIERS.AUTHENTICATED;
            case TIERS.AUTHENTICATED:
                return itemTier === TIERS.AUTHENTICATED;
            default:
                return false;
        }
    }
    
    // Cleanup method
    destroy() {
        if (this.authUnsubscribe) {
            this.authUnsubscribe();
            console.log('🧹 Navigation auth listener cleaned up');
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
    console.log('Is Vite Dev:', navigation.isViteDevServer);
    console.log('Nav Container:', document.getElementById('mainNav'));
    console.log('Nav Items:', document.querySelectorAll('#mainNav .nav-link'));
    console.log('Body Classes:', document.body.className);
};