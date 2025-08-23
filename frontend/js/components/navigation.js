// js/components/navigation.js - Fixed Navigation with Active State
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
        
        // Define navigation structure - NO DASHBOARD
        this.navItems = {
            public: [
                { href: 'index.html', text: 'Home', id: 'index' },
                { href: 'pages/portfolio.html', text: 'Portfolio', id: 'portfolio' },
                { href: 'pages/resume.html', text: 'Resume', id: 'resume' }
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
    
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        
        // Handle various page name formats
        if (page === '' || page === 'index.html') return 'index';
        if (page.endsWith('.html')) return page.replace('.html', '');
        return page;
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
        
        // Build initial navigation (public view)
        this.buildNavigation();
        
        // Setup authentication listener
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
            
            // Rebuild navigation
            this.buildNavigation();
        });
        
        this.isInitialized = true;
        console.log('✅ Navigation Component Ready');
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
        
        // Always add public navigation items
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
        if (!this.currentUser) return;
        
        console.log('🔐 Adding tier navigation for:', this.currentTier);
        
        // Build list of tiers to show based on user's tier
        let visibleTiers = [];
        
        switch (this.currentTier) {
            case TIERS.ADMIN:
                visibleTiers = ['family', 'girlfriend', 'admin'];
                break;
            case TIERS.GIRLFRIEND:
                visibleTiers = ['family', 'girlfriend'];
                break;
            case TIERS.FAMILY:
                visibleTiers = ['family'];
                break;
            case TIERS.AUTHENTICATED:
                // Basic authenticated users see no extra tabs
                visibleTiers = [];
                break;
        }
        
        // Add navigation items for visible tiers
        visibleTiers.forEach(tierKey => {
            if (this.navItems[tierKey]) {
                this.navItems[tierKey].forEach(item => {
                    const link = this.createNavLink(item);
                    container.appendChild(link);
                });
            }
        });
    }
    
    createNavLink(item) {
        const link = document.createElement('a');
        
        // Build the correct path based on current location
        let href = item.href;
        const currentPath = window.location.pathname;
        const isInPages = currentPath.includes('/pages/');
        
        if (isInPages) {
            // We're in pages folder
            if (href === 'index.html') {
                href = '../index.html';
            } else if (href.startsWith('pages/')) {
                href = href.replace('pages/', '');
            }
        }
        
        link.href = href;
        link.className = 'nav-link';
        link.textContent = item.text;
        
        // Add tier-specific classes
        if (item.class) {
            link.className += ' ' + item.class;
        }
        
        // FIXED: Mark active page
        if (item.id === this.currentPage) {
            link.classList.add('active');
            console.log('✨ Active page:', item.id);
        }
        
        return link;
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

// Export for use in other modules
export default navigation;

// Make available globally for debugging
window.navigationComponent = navigation;