// js/config/environment.js - Centralized environment configuration
// This file manages all environment-specific settings

const ENV_CONFIG = {
  // Development environment (localhost)
  development: {
    firebase: {
      apiKey: "AIzaSyCZLt0X2jGoUctHaiCX8-y0Yspz4aU7u_E",
      authDomain: "chaceclabornwebsite.firebaseapp.com",
      projectId: "chaceclabornwebsite",
      storageBucket: "chaceclabornwebsite.firebasestorage.app",
      messagingSenderId: "357343717980",
      appId: "1:357343717980:web:c451370115b7a970689499",
      measurementId: "G-V9CLBVZ0D5"
    },
    features: {
      logging: true,          // Enable console logging
      analytics: false,       // Disable analytics in dev
      debugMode: true,       // Show debug info
      realtimeListeners: false  // Reduce Firebase usage in dev
    }
  },
  
  // Production environment (chaceclaborn.com)
  production: {
    firebase: {
      apiKey: "AIzaSyCZLt0X2jGoUctHaiCX8-y0Yspz4aU7u_E",
      authDomain: "chaceclabornwebsite.firebaseapp.com",
      projectId: "chaceclabornwebsite",
      storageBucket: "chaceclabornwebsite.firebasestorage.app",
      messagingSenderId: "357343717980",
      appId: "1:357343717980:web:c451370115b7a970689499",
      measurementId: "G-V9CLBVZ0D5"
    },
    features: {
      logging: false,         // Disable console logging
      analytics: true,        // Enable analytics
      debugMode: false,      // Hide debug info
      realtimeListeners: true   // Enable realtime features
    }
  }
};

// User tier configuration (centralized)
export const USER_TIERS_CONFIG = {
  ADMIN: {
    name: 'admin',
    emails: ['chaceclaborn@gmail.com'],
    redirectPath: '/pages/admin.html',
    permissions: ['all']
  },
  GIRLFRIEND: {
    name: 'girlfriend',
    emails: ['raehaberbert@gmail.com'],
    redirectPath: '/pages/girlfriend.html',
    permissions: ['girlfriend_tab', 'customization_requests']
  },
  FAMILY: {
    name: 'family',
    emails: [
      'pbclaborn@bellsouth.net',
      'patrick@whitefab.com',
      'patrickclaborn@gmail.com',
      'reivar@bellsouth.net',
      'reiva.claborn@vulc.com',
      'edwardrich43@gmail.com',
      'sondrarich@bellsouth.net',
      'sondraarichardson@icloud.com'
    ],
    redirectPath: '/pages/family.html',
    permissions: ['family_tab']
  },
  AUTHENTICATED: {
    name: 'authenticated',
    emails: [],  // Any logged-in user
    redirectPath: null,  // Stay on current page
    permissions: ['authenticated_content']
  },
  PUBLIC: {
    name: 'public',
    emails: [],  // Not logged in
    redirectPath: null,
    permissions: ['public_content']
  }
};

// Navigation configuration
export const NAVIGATION_CONFIG = {
  public: [
    { href: 'index.html', text: 'Home', id: 'home' },
    { href: 'pages/portfolio.html', text: 'Portfolio', id: 'portfolio' },
    { href: 'pages/resume.html', text: 'Resume', id: 'resume' }
  ],
  authenticated: [],
  family: [
    { 
      href: 'pages/family.html', 
      text: 'Family', 
      id: 'family', 
      tier: 'family',
      class: 'tier-nav family-nav'
    }
  ],
  girlfriend: [
    { 
      href: 'pages/girlfriend.html', 
      text: "Raeha's Tab", 
      id: 'girlfriend', 
      tier: 'girlfriend',
      class: 'tier-nav girlfriend-nav'
    }
  ],
  admin: [
    { 
      href: 'pages/admin.html', 
      text: 'Admin', 
      id: 'admin', 
      tier: 'admin',
      class: 'tier-nav admin-nav'
    }
  ]
};

// Protected pages configuration
export const PROTECTED_PAGES = ['dashboard', 'family', 'girlfriend', 'admin'];
export const PUBLIC_PAGES = ['index', 'portfolio', 'resume', 'about', 'contact', ''];

// Detect current environment
function getCurrentEnvironment() {
  const hostname = window.location.hostname;
  
  // Check for localhost or development environments
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.includes('test') ||
      hostname.includes('staging')) {
    return 'development';
  }
  
  return 'production';
}

// Get current configuration
const currentEnv = getCurrentEnvironment();
export const config = ENV_CONFIG[currentEnv];
export const isDevelopment = currentEnv === 'development';
export const isProduction = currentEnv === 'production';

// Export Firebase config directly for convenience
export const firebaseConfig = config.firebase;

// Log environment info (only in development)
if (isDevelopment) {
  console.log(`🌍 Environment: ${currentEnv}`);
  console.log('⚙️ Configuration:', config);
}