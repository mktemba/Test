/**
 * User preferences management
 * Similar to preferences.ts in online-go.com
 */

class PreferencesManager {
    constructor() {
        this.defaults = {
            // UI preferences
            theme: 'default',
            soundEnabled: true,
            animationSpeed: 'medium',
            showHints: true,
            confirmActions: true,

            // Game preferences
            aiDifficulty: 'medium',
            autoSort: true,
            highlightWaiting: true,
            showTileCount: true,

            // Tutorial preferences
            skipIntro: false,
            showTips: true,
            autoAdvance: false,

            // Accessibility
            reducedMotion: false,
            highContrast: false,
            fontSize: 'medium'
        };

        this.cache = null;
        this.listeners = new Map();
        this.allowedOrigins = [
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'https://mahjong-app.com'
        ];
    }

    /**
     * Validate origin for localStorage operations
     * @returns {boolean}
     */
    validateOrigin() {
        const origin = window.location.origin;

        // Allow localhost on any port for development
        if (origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:')) {
            return true;
        }

        return this.allowedOrigins.includes(origin);
    }

    /**
     * Load all preferences from storage
     * @returns {Object}
     */
    load() {
        if (this.cache) return this.cache;

        // Validate origin before localStorage access
        if (!this.validateOrigin()) {
            console.error('localStorage access blocked: Invalid origin');
            this.cache = Object.assign({}, this.defaults);
            return this.cache;
        }

        try {
            const stored = localStorage.getItem('mahjong_preferences');
            if (stored) {
                this.cache = Object.assign({}, this.defaults, JSON.parse(stored));
            } else {
                this.cache = Object.assign({}, this.defaults);
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
            this.cache = Object.assign({}, this.defaults);
        }

        return this.cache;
    }

    /**
     * Save all preferences to storage
     */
    save() {
        // Validate origin before localStorage access
        if (!this.validateOrigin()) {
            console.error('localStorage access blocked: Invalid origin');
            return;
        }

        try {
            localStorage.setItem('mahjong_preferences', JSON.stringify(this.cache));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    /**
     * Get a preference value
     * @param {string} key
     * @returns {*}
     */
    get(key) {
        const prefs = this.load();
        return prefs[key];
    }

    /**
     * Set a preference value
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
        const prefs = this.load();
        const oldValue = prefs[key];

        prefs[key] = value;
        this.save();

        if (oldValue !== value) {
            this.notifyListeners(key, value, oldValue);
        }
    }

    /**
     * Set multiple preferences at once
     * @param {Object} values
     */
    setMultiple(values) {
        const prefs = this.load();

        Object.keys(values).forEach(key => {
            const oldValue = prefs[key];
            const newValue = values[key];

            prefs[key] = newValue;

            if (oldValue !== newValue) {
                this.notifyListeners(key, newValue, oldValue);
            }
        });

        this.save();
    }

    /**
     * Reset all preferences to defaults
     */
    reset() {
        this.cache = Object.assign({}, this.defaults);
        this.save();

        Object.keys(this.defaults).forEach(key => {
            this.notifyListeners(key, this.defaults[key], null);
        });
    }

    /**
     * Reset a specific preference to default
     * @param {string} key
     */
    resetKey(key) {
        if (key in this.defaults) {
            this.set(key, this.defaults[key]);
        }
    }

    /**
     * Listen for preference changes
     * @param {string} key
     * @param {Function} callback
     * @returns {Function} Unsubscribe function
     */
    watch(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }

        this.listeners.get(key).push(callback);

        return () => {
            const callbacks = this.listeners.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    /**
     * Notify listeners of preference changes
     * @param {string} key
     * @param {*} newValue
     * @param {*} oldValue
     */
    notifyListeners(key, newValue, oldValue) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`Error in preference listener for ${key}:`, error);
                }
            });
        }
    }

    /**
     * Get all preferences
     * @returns {Object}
     */
    getAll() {
        return Object.assign({}, this.load());
    }

    /**
     * Export preferences for backup
     * @returns {string}
     */
    export() {
        return JSON.stringify(this.load(), null, 2);
    }

    /**
     * Validate a preference value against known valid values
     * @param {string} key
     * @param {*} value
     * @returns {boolean}
     */
    isValidValue(key, value) {
        // Get valid values from CONFIG if available, otherwise use inline validation
        const validValues = typeof CONFIG !== 'undefined' && CONFIG.VALID_PREFERENCES
            ? CONFIG.VALID_PREFERENCES[key]
            : null;

        if (!validValues) {
            // Fallback: just check type matches default
            return typeof value === typeof this.defaults[key];
        }

        return validValues.includes(value);
    }

    /**
     * Sanitize string to prevent XSS
     * @param {string} str
     * @returns {string}
     */
    sanitizeString(str) {
        if (typeof str !== 'string') return str;

        // Basic XSS prevention: remove script tags and common attack vectors
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .substring(0, typeof CONFIG !== 'undefined' ? CONFIG.MAX_STRING_LENGTH : 10000);
    }

    /**
     * Import preferences from backup
     * @param {string} json
     */
    import(json) {
        try {
            const imported = JSON.parse(json);

            // Validate and sanitize imported values
            const validated = {};
            Object.keys(this.defaults).forEach(key => {
                if (key in imported) {
                    const value = imported[key];

                    // Sanitize strings
                    const sanitized = typeof value === 'string' ? this.sanitizeString(value) : value;

                    // Validate against known valid values
                    if (this.isValidValue(key, sanitized)) {
                        validated[key] = sanitized;
                    } else {
                        console.warn(`Invalid value for preference ${key}: ${sanitized}, using default`);
                    }
                }
            });

            this.setMultiple(validated);
        } catch (error) {
            console.error('Error importing preferences:', error);
        }
    }
}

// Singleton instance
const preferences = new PreferencesManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { preferences, PreferencesManager };
}
