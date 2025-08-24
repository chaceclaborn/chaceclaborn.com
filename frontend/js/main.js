// frontend/js/main.js - FIXED VERSION with React Components
import { app, auth, db } from './firebase/config'
import React from 'react'
import ReactDOM from 'react-dom/client'

// Core modules
import './firebase/auth-service'
import './firebase/auth-tiers'
import './auth-init'
import './components/navigation'
import './firebase/terms-manager'
import './components/auth-button-mount'

// Import React Components
import ImageCarousel from './components/ImageCarousel'
import QuotesCarousel from './components/QuotesCarousel'

// Expose Firebase globally
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
        
        // Always load AI Assistant and chatbot (legacy scripts)
        this.loadLegacyScripts(['chatbot-botui.js', 'ai-assistant.js'])
    }

    initPageSpecific() {
        if (isHomePage) {
            this.initHome()
        } else if (pageType === 'portfolio') {
            console.log('📁 Portfolio page initialized')
        } else if (pageType === 'admin') {
            this.initAdmin()
        } else if (pageType === 'girlfriend') {
            this.initGirlfriend()
        } else if (pageType === 'family') {
            console.log('👨‍👩‍👧‍👦 Family page initialized')
        }
    }

    initHome() {
        console.log('🏠 Initializing home page...')
        
        // Mount React Components instead of loading legacy scripts
        this.mountHomeComponents()
        
        // Load feedback widget
        import('./feedback-widget')
            .then(() => console.log('📊 Feedback widget loaded'))
            .catch(err => console.warn('Feedback widget not needed:', err.message))
    }

    mountHomeComponents() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.mountComponents())
        } else {
            this.mountComponents()
        }
    }

    mountComponents() {
        // Mount Image Carousel
        const imagePanel = document.querySelector('.image-panel')
        if (imagePanel) {
            // Clear existing content
            const slider = imagePanel.querySelector('.image-slider')
            const indicators = imagePanel.querySelector('.slide-indicators')
            
            // Only clear if not already React-mounted
            if (slider && !imagePanel.hasAttribute('data-react-mounted')) {
                imagePanel.innerHTML = ''
                const root = ReactDOM.createRoot(imagePanel)
                root.render(React.createElement(ImageCarousel))
                imagePanel.setAttribute('data-react-mounted', 'true')
                console.log('🖼️ Image carousel mounted')
            }
        }

        // Mount Quotes Carousel
        const quotesSection = document.querySelector('.quotes-section')
        if (quotesSection && !quotesSection.hasAttribute('data-react-mounted')) {
            quotesSection.innerHTML = ''
            const root = ReactDOM.createRoot(quotesSection)
            root.render(React.createElement(QuotesCarousel))
            quotesSection.setAttribute('data-react-mounted', 'true')
            console.log('💬 Quotes carousel mounted')
        }
    }

    initAdmin() {
        console.log('👑 Initializing admin page...')
        // Admin-specific scripts if needed
        this.loadLegacyScripts(['admin-panel.js'])
    }

    initGirlfriend() {
        console.log('💝 Initializing girlfriend page...')
        // Load customization handler
        import('./raeha-customization')
            .then(() => console.log('💝 Customization handler loaded'))
            .catch(err => console.warn('Customization not needed:', err.message))
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
        // For scripts that haven't been converted to React yet
        scripts.forEach(src => {
            if (!document.querySelector(`script[src="/js/${src}"]`)) {
                const script = document.createElement('script')
                script.src = `/js/${src}`
                script.type = 'text/javascript'
                document.body.appendChild(script)
            }
        })
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App())
} else {
    new App()
}

export default App