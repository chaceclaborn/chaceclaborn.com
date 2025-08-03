/**
 * API Service Layer
 * Handles all communication with Yahoo Finance API
 */

class StockAPI {
    constructor() {
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessingQueue = false;
    }

    /**
     * Get cache key for a request
     */
    getCacheKey(endpoint, params) {
        return `${endpoint}_${JSON.stringify(params)}`;
    }

    /**
     * Check if cached data is still valid
     */
    isCacheValid(timestamp) {
        return Date.now() - timestamp < CONFIG.CACHE.DURATION;
    }

    /**
     * Get data from cache if available and valid
     */
    getFromCache(endpoint, params) {
        if (!CONFIG.CACHE.ENABLED) return null;

        const key = this.getCacheKey(endpoint, params);
        const cached = this.cache.get(key);

        if (cached && this.isCacheValid(cached.timestamp)) {
            console.log('Cache hit:', key);
            return cached.data;
        }

        return null;
    }

    /**
     * Save data to cache
     */
    saveToCache(endpoint, params, data) {
        if (!CONFIG.CACHE.ENABLED) return;

        const key = this.getCacheKey(endpoint, params);
        
        // Implement LRU cache
        if (this.cache.size >= CONFIG.CACHE.MAX_SIZE) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Make API request with retry logic
     */
    async makeRequest(endpoint, params = {}, retries = 0) {
        const url = new URL(`${CONFIG.API.BASE_URL}${endpoint}`);
        
        // Add parameters to URL
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': CONFIG.API.API_KEY,
                'X-RapidAPI-Host': 'yahoo-finance-api.vercel.app'
            }
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);

            const response = await fetch(url.toString(), {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('API request error:', error);

            // Retry logic
            if (retries < CONFIG.API.RETRY_ATTEMPTS) {
                console.log(`Retrying... Attempt ${retries + 1}`);
                await this.delay(CONFIG.API.RETRY_DELAY);
                return this.makeRequest(endpoint, params, retries + 1);
            }

            throw error;
        }
    }

    /**
     * Delay helper for retry logic
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get stock quote data
     */
    async getQuote(symbol) {
        // Check cache first
        const cached = this.getFromCache(CONFIG.API.ENDPOINTS.QUOTE, { symbols: symbol });
        if (cached) return cached;

        try {
            const data = await this.makeRequest(CONFIG.API.ENDPOINTS.QUOTE, {
                symbols: symbol
            });

            // Save to cache
            this.saveToCache(CONFIG.API.ENDPOINTS.QUOTE, { symbols: symbol }, data);

            return data;
        } catch (error) {
            console.error('Error fetching quote:', error);
            throw new Error(CONFIG.ERRORS.GENERIC);
        }
    }

    /**
     * Get multiple stock quotes
     */
    async getMultipleQuotes(symbols) {
        const symbolString = symbols.join(',');
        
        // Check cache first
        const cached = this.getFromCache(CONFIG.API.ENDPOINTS.QUOTE, { symbols: symbolString });
        if (cached) return cached;

        try {
            const data = await this.makeRequest(CONFIG.API.ENDPOINTS.QUOTE, {
                symbols: symbolString
            });

            // Save to cache
            this.saveToCache(CONFIG.API.ENDPOINTS.QUOTE, { symbols: symbolString }, data);

            return data;
        } catch (error) {
            console.error('Error fetching multiple quotes:', error);
            throw new Error(CONFIG.ERRORS.GENERIC);
        }
    }

    /**
     * Search for stock symbols
     */
    async searchSymbols(query) {
        if (!query || query.length < 1) {
            return { quotes: [] };
        }

        // Check cache first
        const cached = this.getFromCache(CONFIG.API.ENDPOINTS.SEARCH, { q: query });
        if (cached) return cached;

        try {
            const data = await this.makeRequest(CONFIG.API.ENDPOINTS.SEARCH, {
                q: query,
                quotesCount: CONFIG.UI.MAX_SUGGESTIONS
            });

            // Save to cache
            this.saveToCache(CONFIG.API.ENDPOINTS.SEARCH, { q: query }, data);

            return data;
        } catch (error) {
            console.error('Error searching symbols:', error);
            return { quotes: [] };
        }
    }

    /**
     * Get trending stocks
     */
    async getTrending() {
        // Check cache first
        const cached = this.getFromCache(CONFIG.API.ENDPOINTS.TRENDING, {});
        if (cached) return cached;

        try {
            const data = await this.makeRequest(CONFIG.API.ENDPOINTS.TRENDING);

            // Save to cache
            this.saveToCache(CONFIG.API.ENDPOINTS.TRENDING, {}, data);

            return data;
        } catch (error) {
            console.error('Error fetching trending stocks:', error);
            throw new Error(CONFIG.ERRORS.GENERIC);
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }

    /**
     * Get cache size
     */
    getCacheSize() {
        return this.cache.size;
    }
}

// Create and export singleton instance
const stockAPI = new StockAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = stockAPI;
}