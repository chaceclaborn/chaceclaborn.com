// frontend/js/main.js - Single Entry Point for Vite
// This is THE MOST PROFESSIONAL SOLUTION using your existing Vite setup

// Core Firebase imports - using relative paths for now
import { app, auth, db } from './firebase/config'

// Core modules - no .js extensions with Vite!
import './firebase/auth-service'
import './firebase/auth-tiers'
import './auth-init'
import './components/navigation'  // Fixed navigation without Dashboard
import './firebase/terms-manager'
import './components/auth-button-mount'

// Expose Firebase globally (for legacy code)
window.firebaseApp = app
window.auth = auth
window.db = db

// Page type detection
const pageType = document.body.dataset.page || 'default'
const isHomePage = window.location.pathname === '/' || 
                   window.location.pathname.endsWith('index.html')

// Initialize app
class App {
    constructor() {
        console.log('🚀 Initializing app with Vite...')
        this.initCommon()
        this.initPageSpecific()
    }

    initCommon() {
        // Mobile menu
        this.initMobileMenu()
        
        // Always load AI Assistant and chatbot
        this.loadLegacyScripts(['chatbot-botui.js', 'ai-assistant.js'])
    }

    initPageSpecific() {
        if (isHomePage) {
            this.initHome()
        } else if (pageType === 'portfolio') {
            console.log('📁 Portfolio page initialized')
        } else if (pageType === 'admin') {
            this.initAdmin()
        }
    }

    initHome() {
        console.log('🏠 Initializing home page...')
        
        // Load all home page scripts immediately
        this.loadLegacyScripts(['carousel.js', 'quotes.js'])
        
        // Load feedback widget (it exists in js/ folder)
        import('./feedback-widget')
            .then(() => console.log('📊 Feedback widget loaded'))
            .catch(err => console.warn('Feedback widget not needed:', err.message))
    }

    initAdmin() {
        console.log('👑 Initializing admin page...')
        // Admin features are handled in the HTML page itself
    }

    initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn')
        const nav = document.querySelector('.main-nav')
        
        if (btn && nav) {
            btn.addEventListener('click', () => {
                nav.classList.toggle('mobile-active')
                btn.classList.toggle('active')
            })
        }
    }

    loadLegacyScripts(scripts) {
        // Load scripts immediately without defer
        scripts.forEach(src => {
            // Check if script already exists
            if (!document.querySelector(`script[src="/js/${src}"]`)) {
                const script = document.createElement('script')
                script.src = `/js/${src}`
                document.body.appendChild(script)
                console.log(`📜 Loaded legacy script: ${src}`)
            }
        })
    }

    initAdmin() {
        console.log('👑 Initializing admin page...')
        // Admin features are handled in the HTML page itself
    }

    initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn')
        const nav = document.querySelector('.main-nav')
        
        if (btn && nav) {
            btn.addEventListener('click', () => {
                nav.classList.toggle('mobile-active')
                btn.classList.toggle('active')
            })
        }
    }

    loadLegacyScripts(scripts) {
        // For non-module scripts that haven't been converted yet
        scripts.forEach(src => {
            const script = document.createElement('script')
            script.src = `/js/${src}`
            script.defer = true  // Ensure DOM is ready
            document.body.appendChild(script)
        })
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App())
} else {
    new App()
}

// Hot Module Replacement (HMR) - Vite feature for instant updates!
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        console.log('🔥 HMR update received')
        // Page will auto-refresh with changes
    })
}

console.log('✅ Vite app initialized')