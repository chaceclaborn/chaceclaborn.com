/**
 * Application Configuration
 * Central configuration file for all app settings
 */

const CONFIG = {
    // API Configuration
    API: {
        // Yahoo Finance API via RapidAPI
        BASE_URL: 'https://yahoo-finance-api.vercel.app',
        ENDPOINTS: {
            QUOTE: '/api/v6/finance/quote',
            SEARCH: '/api/v6/finance/auto-complete',
            TRENDING: '/api/v6/finance/trending/US'
        },
        // Add your RapidAPI key here or use environment variable
        API_KEY: process.env.YAHOO_FINANCE_API_KEY || 'YOUR_API_KEY_HERE',
        TIMEOUT: 10000, // 10 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 second
    },

    // Cache Configuration
    CACHE: {
        ENABLED: true,
        DURATION: 60000, // 1 minute
        MAX_SIZE: 100, // Maximum number of cached items
        STORAGE_KEY: 'stockTrackerCache'
    },

    // UI Configuration
    UI: {
        DEBOUNCE_DELAY: 300, // Milliseconds
        ANIMATION_DURATION: 300,
        MAX_SUGGESTIONS: 8,
        UPDATE_INTERVAL: 30000, // 30 seconds
        TOAST_DURATION: 3000,
        DATE_FORMAT: {
            locale: 'en-US',
            options: {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }
        }
    },

    // Storage Configuration
    STORAGE: {
        WATCHLIST_KEY: 'stockTrackerWatchlist',
        THEME_KEY: 'stockTrackerTheme',
        PREFERENCES_KEY: 'stockTrackerPreferences',
        MAX_WATCHLIST_SIZE: 20
    },

    // Default Values
    DEFAULTS: {
        WATCHLIST: ['AAPL', 'GOOGL', 'MSFT', 'AMZN'],
        THEME: 'light',
        CURRENCY: 'USD',
        MARKET: 'US'
    },

    // Feature Flags
    FEATURES: {
        ENABLE_SUGGESTIONS: true,
        ENABLE_NOTIFICATIONS: false,
        ENABLE_EXPORT: true,
        ENABLE_CHARTS: false,
        ENABLE_NEWS: false
    },

    // Error Messages
    ERRORS: {
        NETWORK: 'Network error. Please check your connection.',
        API_KEY: 'Invalid API key. Please check your configuration.',
        RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
        INVALID_SYMBOL: 'Invalid stock symbol. Please try again.',
        NOT_FOUND: 'Stock symbol not found.',
        GENERIC: 'An error occurred. Please try again.',
        TIMEOUT: 'Request timed out. Please try again.',
        PARSE_ERROR: 'Error parsing data. Please try again.'
    },

    // Success Messages
    SUCCESS: {
        ADDED_TO_WATCHLIST: 'Added to watchlist',
        REMOVED_FROM_WATCHLIST: 'Removed from watchlist',
        DATA_UPDATED: 'Data updated successfully',
        SETTINGS_SAVED: 'Settings saved'
    },

    // Stock Market Hours (EST)
    MARKET_HOURS: {
        OPEN: { hour: 9, minute: 30 },
        CLOSE: { hour: 16, minute: 0 },
        TIMEZONE: 'America/New_York'
    },

    // Validation Rules
    VALIDATION: {
        SYMBOL: {
            MIN_LENGTH: 1,
            MAX_LENGTH: 5,
            PATTERN: /^[A-Z]{1,5}$/
        }
    }
};

// Freeze configuration to prevent accidental modifications
Object.freeze(CONFIG);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}