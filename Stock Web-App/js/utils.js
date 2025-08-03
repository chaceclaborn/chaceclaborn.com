/**
 * Utility Functions
 * Helper functions used throughout the application
 */

const Utils = {
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately
     * @returns {Function} Debounced function
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Format number with appropriate suffix (K, M, B, T)
     * @param {number} num - Number to format
     * @param {number} digits - Number of decimal places
     * @returns {string} Formatted number
     */
    formatNumber(num, digits = 1) {
        if (num === null || num === undefined) return '-';
        
        const lookup = [
            { value: 1e12, symbol: 'T' },
            { value: 1e9, symbol: 'B' },
            { value: 1e6, symbol: 'M' },
            { value: 1e3, symbol: 'K' }
        ];
        
        const item = lookup.find(item => num >= item.value);
        return item ? (num / item.value).toFixed(digits) + item.symbol : num.toString();
    },

    /**
     * Format currency value
     * @param {number} value - Value to format
     * @param {string} currency - Currency code
     * @param {string} locale - Locale for formatting
     * @returns {string} Formatted currency
     */
    formatCurrency(value, currency = 'USD', locale = 'en-US') {
        if (value === null || value === undefined) return '-';
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },

    /**
     * Format percentage value
     * @param {number} value - Value to format
     * @param {number} digits - Number of decimal places
     * @returns {string} Formatted percentage
     */
    formatPercentage(value, digits = 2) {
        if (value === null || value === undefined) return '-';
        
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(digits)}%`;
    },

    /**
     * Format date/time
     * @param {Date|string|number} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return new Intl.DateTimeFormat('en-US', formatOptions).format(new Date(date));
    },

    /**
     * Get relative time string (e.g., "2 hours ago")
     * @param {Date|string|number} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];
        
        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return count === 1 
                    ? `1 ${interval.label} ago` 
                    : `${count} ${interval.label}s ago`;
            }
        }
        
        return 'just now';
    },

    /**
     * Deep clone an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Check if object is empty
     * @param {Object} obj - Object to check
     * @returns {boolean} True if empty
     */
    isEmpty(obj) {
        if (!obj) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return false;
    },

    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string} Unique ID
     */
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
    },

    /**
     * Validate stock symbol
     * @param {string} symbol - Stock symbol to validate
     * @returns {boolean} True if valid
     */
    isValidSymbol(symbol) {
        return /^[A-Z]{1,5}$/.test(symbol);
    },

    /**
     * Get market status
     * @returns {Object} Market status info
     */
    getMarketStatus() {
        const now = new Date();
        const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const day = nyTime.getDay();
        const hours = nyTime.getHours();
        const minutes = nyTime.getMinutes();
        
        // Market closed on weekends
        if (day === 0 || day === 6) {
            return { isOpen: false, status: 'Weekend - Market Closed' };
        }
        
        // Market hours: 9:30 AM - 4:00 PM EST
        const currentMinutes = hours * 60 + minutes;
        const openMinutes = 9 * 60 + 30; // 9:30 AM
        const closeMinutes = 16 * 60; // 4:00 PM
        
        if (currentMinutes < openMinutes) {
            return { isOpen: false, status: 'Pre-Market' };
        } else if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
            return { isOpen: true, status: 'Market Open' };
        } else {
            return { isOpen: false, status: 'After-Hours' };
        }
    },

    /**
     * Parse API error response
     * @param {Error|Response} error - Error object
     * @returns {string} User-friendly error message
     */
    parseError(error) {
        if (error.status === 401) {
            return CONFIG.ERRORS.API_KEY;
        } else if (error.status === 429) {
            return CONFIG.ERRORS.RATE_LIMIT;
        } else if (error.status === 404) {
            return CONFIG.ERRORS.NOT_FOUND;
        } else if (error.name === 'AbortError') {
            return CONFIG.ERRORS.TIMEOUT;
        } else if (error.message.includes('network')) {
            return CONFIG.ERRORS.NETWORK;
        }
        return CONFIG.ERRORS.GENERIC;
    },

    /**
     * Local storage wrapper with error handling
     */
    storage: {
        get(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return null;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error writing to localStorage:', error);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    },

    /**
     * Check if browser supports required features
     * @returns {Object} Feature support status
     */
    checkBrowserSupport() {
        return {
            localStorage: typeof Storage !== 'undefined',
            fetch: typeof fetch !== 'undefined',
            promises: typeof Promise !== 'undefined',
            css: {
                grid: CSS.supports('display', 'grid'),
                customProperties: CSS.supports('--test', '0')
            }
        };
    },

    /**
     * Simple event emitter
     */
    EventEmitter: class {
        constructor() {
            this.events = {};
        }

        on(event, listener) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(listener);
        }

        off(event, listenerToRemove) {
            if (!this.events[event]) return;
            
            this.events[event] = this.events[event].filter(
                listener => listener !== listenerToRemove
            );
        }

        emit(event, data) {
            if (!this.events[event]) return;
            
            this.events[event].forEach(listener => listener(data));
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}