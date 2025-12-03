// src/js/main.js - Professional Entry Point with Modern Module System

// ============================================
// IMPORT TAILWIND & CUSTOM STYLES
// ============================================
import './styles/main.css'

// ============================================
// IMPORT FIREBASE & CORE MODULES
// ============================================
import { app, auth, db } from './services/firebase/config'
import './services/firebase/auth-service'
import './services/firebase/auth-tiers'
import './components/navigation/navigation'
import './services/firebase/terms-manager'
import './components/auth/auth-button-mount'

// ============================================
// EXPOSE FIREBASE GLOBALLY (for legacy compatibility)
// ============================================
window.firebaseApp = app
window.auth = auth
window.db = db

// ============================================
// APPLICATION CLASS
// ============================================
class Application {
    constructor() {
        this.pageType = document.body.dataset.page || 'default'
        this.isHomePage = window.location.pathname === '/' || 
                          window.location.pathname.endsWith('index.html')
        
        console.log('🚀 Initializing Application')
        console.log(`📄 Page Type: ${this.pageType}`)
        console.log(`🏠 Is Home: ${this.isHomePage}`)
        
        this.init()
    }

    async init() {
        try {
            // Initialize common features
            await this.initCommon()
            
            // Initialize page-specific features
            await this.initPageSpecific()
            
            console.log('✅ Application initialized successfully')
        } catch (error) {
            console.error('❌ Application initialization error:', error)
        }
    }

    async initCommon() {
        // Mobile menu
        this.initMobileMenu()
        
        // Load chatbot
        await this.loadChatbot()
        
        // Load AI Assistant if exists
        await this.loadAIAssistant()
    }

    async initPageSpecific() {
        switch(this.pageType) {
            case 'home':
            case 'default':
                if (this.isHomePage) {
                    await this.initHomePage()
                }
                break
            case 'portfolio':
                await this.initPortfolio()
                break
            case 'admin':
                await this.initAdminPage()
                break
            case 'girlfriend':
                await this.initGirlfriendPage()
                break
            case 'family':
                await this.initFamilyPage()
                break
            case 'resume':
                console.log('📄 Resume page initialized')
                break
            default:
                console.log(`📄 ${this.pageType} page initialized`)
        }
    }

    // ============================================
    // HOME PAGE
    // ============================================
    async initHomePage() {
        console.log('🏠 Initializing home page features...')
        
        // Initialize image carousel
        this.initImageCarousel()
        
        // Initialize quotes carousel
        this.initQuotesCarousel()
        
        // Load feedback widget
        try {
            await import('./feedback-widget')
            console.log('✅ Feedback widget loaded')
        } catch (err) {
            console.log('📊 Feedback widget not available:', err.message)
        }
    }

    initImageCarousel() {
        const slides = document.querySelectorAll('.image-slider .slide')
        const indicators = document.querySelectorAll('.slide-indicators .indicator')
        
        if (slides.length === 0) return
        
        let currentSlide = 0
        
        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'))
            indicators.forEach(indicator => indicator.classList.remove('active'))
            
            slides[index].classList.add('active')
            if (indicators[index]) {
                indicators[index].classList.add('active')
            }
        }
        
        // Auto-advance slides
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length
            showSlide(currentSlide)
        }, 5000)
        
        // Click handlers for indicators
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentSlide = index
                showSlide(currentSlide)
            })
        })
        
        console.log('📸 Image carousel initialized')
    }

    initQuotesCarousel() {
        // Quotes data - YOUR ORIGINAL QUOTES
        const quotes = [
            { text: "Great things come from hard work and perseverance. No excuses.", author: "Kobe Bryant" },
            { text: "I've failed over and over and over again in my life. And that is why I succeed.", author: "Michael Jordan" },
            { text: "Don't count the days; make the days count.", author: "Muhammad Ali" },
            { text: "Success is not an accident. Success is a choice.", author: "Stephen Curry" },
            { text: "Compare yourself to who you were yesterday, not to who someone else is today.", author: "Jordan Peterson" },
            { text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", author: "Muhammad Ali" },
            { text: "The most important thing is to try and inspire people so that they can be great in whatever they want to do.", author: "Kobe Bryant" }
        ]
        
        const quotesSlider = document.querySelector('.quotes-slider')
        const quoteIndicators = document.querySelector('.quote-indicators')
        
        if (!quotesSlider) return
        
        // Generate quote slides
        quotes.forEach((quote, index) => {
            const slide = document.createElement('div')
            slide.className = `quote-slide ${index === 0 ? 'active' : ''}`
            slide.innerHTML = `
                <p class="quote-text">"${quote.text}"</p>
                <p class="quote-author">- ${quote.author}</p>
            `
            quotesSlider.appendChild(slide)
            
            // Create indicator
            const indicator = document.createElement('span')
            indicator.className = `quote-indicator ${index === 0 ? 'active' : ''}`
            indicator.dataset.quote = index
            quoteIndicators?.appendChild(indicator)
        })
        
        // Set up rotation
        let currentQuote = 0
        const quoteSlides = quotesSlider.querySelectorAll('.quote-slide')
        const indicators = quoteIndicators?.querySelectorAll('.quote-indicator')
        
        const showQuote = (index) => {
            quoteSlides.forEach(slide => slide.classList.remove('active'))
            indicators?.forEach(ind => ind.classList.remove('active'))
            
            quoteSlides[index].classList.add('active')
            if (indicators?.[index]) {
                indicators[index].classList.add('active')
            }
        }
        
        // Auto-rotate quotes
        setInterval(() => {
            currentQuote = (currentQuote + 1) % quotes.length
            showQuote(currentQuote)
        }, 5000)
        
        // Click handlers
        indicators?.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentQuote = index
                showQuote(currentQuote)
            })
        })
        
        console.log('💬 Quotes carousel initialized')
    }

    // ============================================
    // PORTFOLIO PAGE
    // ============================================
    async initPortfolio() {
        console.log('📁 Portfolio page initialized')
        // Add portfolio-specific features here
    }

    // ============================================
    // ADMIN PAGE
    // ============================================
    async initAdminPage() {
        console.log('👑 Initializing admin page...')
        
        // Load admin panel if exists
        try {
            await this.loadScript('admin-panel.js')
            console.log('✅ Admin panel loaded')
        } catch (err) {
            console.log('Admin panel not available')
        }
    }

    // ============================================
    // GIRLFRIEND PAGE
    // ============================================
    async initGirlfriendPage() {
        console.log('💝 Initializing girlfriend page...')
        
        try {
            await import('./raeha-customization')
            console.log('✅ Customization handler loaded')
        } catch (err) {
            console.log('Customization module not available')
        }
    }

    // ============================================
    // FAMILY PAGE
    // ============================================
    async initFamilyPage() {
        console.log('👨‍👩‍👧‍👦 Family page initialized')
        // Add family-specific features here
    }

    // ============================================
    // COMMON FEATURES
    // ============================================
    initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn')
        const nav = document.querySelector('.main-nav')
        
        if (btn && nav) {
            btn.addEventListener('click', () => {
                nav.classList.toggle('mobile-active')
                btn.classList.toggle('active')
                console.log('📱 Mobile menu toggled')
            })
            console.log('✅ Mobile menu initialized')
        }
    }

    async loadChatbot() {
        try {
            const script = document.createElement('script')
            script.src = '/src/js/chatbot-botui.js'
            script.type = 'text/javascript'
            document.body.appendChild(script)
            console.log('💬 Chatbot script loaded')
        } catch (err) {
            console.log('Chatbot not available')
        }
    }

    async loadAIAssistant() {
        try {
            const script = document.createElement('script')
            script.src = '/src/js/ai-assistant.js'
            script.type = 'text/javascript'
            document.body.appendChild(script)
            console.log('🤖 AI Assistant loaded')
        } catch (err) {
            console.log('AI Assistant not available')
        }
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const fullPath = `/src/js/${src}`
            
            // Check if already loaded
            if (document.querySelector(`script[src="${fullPath}"]`)) {
                resolve('Already loaded')
                return
            }
            
            const script = document.createElement('script')
            script.src = fullPath
            script.type = 'text/javascript'
            script.onload = resolve
            script.onerror = reject
            document.body.appendChild(script)
        })
    }
}

// ============================================
// INITIALIZE WHEN DOM IS READY
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new Application()
    })
} else {
    window.app = new Application()
}

// Export for debugging
export default Application