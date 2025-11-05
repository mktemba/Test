/**
 * Security utilities for the Mahjong Learning App
 * Implements XSS protection, input validation, and secure data handling
 *
 * OWASP Top 10 2021 Compliance:
 * - A03:2021 – Injection (XSS Prevention)
 * - A04:2021 – Insecure Design (Origin Validation)
 * - A05:2021 – Security Misconfiguration (Token Validation)
 * - A08:2021 – Software and Data Integrity Failures (Data Validation)
 */

const Security = {
    /**
     * Escape HTML to prevent XSS attacks
     * OWASP Recommendation: Always escape user-controlled data before rendering
     * @param {string} text - Text to escape
     * @returns {string} Escaped text safe for HTML display
     */
    escapeHTML(text) {
        if (typeof text !== 'string') {
            return String(text);
        }

        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Sanitize error messages before display
     * Prevents XSS in error messages and removes sensitive information
     * @param {string} message - Error message
     * @returns {string} Sanitized message
     */
    sanitizeErrorMessage(message) {
        if (typeof message !== 'string') {
            message = String(message);
        }

        // Escape HTML entities
        const escaped = this.escapeHTML(message);

        // Remove potential file paths that could leak system information
        return escaped
            .replace(/\/Users\/[^\s]+/g, '[path]')
            .replace(/C:\\[^\s]+/g, '[path]')
            .replace(/\/home\/[^\s]+/g, '[path]')
            .replace(/\/var\/[^\s]+/g, '[path]');
    },

    /**
     * Validate origin for localStorage operations
     * Additional layer beyond browser's same-origin policy
     * @param {string} origin - Origin to validate
     * @returns {boolean} True if origin is allowed
     */
    validateOrigin(origin) {
        const allowedOrigins = [
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'https://mahjong-app.com'
        ];

        // Allow localhost on any port for development
        if (origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:')) {
            return true;
        }

        return allowedOrigins.includes(origin);
    },

    /**
     * Secure localStorage wrapper with origin validation
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    secureLocalStorageSet(key, value) {
        try {
            // Validate origin before any localStorage operation
            if (!this.validateOrigin(window.location.origin)) {
                console.error('localStorage access blocked: Invalid origin');
                return false;
            }

            // Sanitize key to prevent key injection attacks
            const sanitizedKey = this.sanitizeStorageKey(key);

            // Serialize and store
            const serialized = JSON.stringify(value);
            localStorage.setItem(sanitizedKey, serialized);
            return true;
        } catch (error) {
            console.error('Secure storage error:', this.sanitizeErrorMessage(error.message));
            return false;
        }
    },

    /**
     * Secure localStorage getter with origin validation
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Retrieved value or default
     */
    secureLocalStorageGet(key, defaultValue = null) {
        try {
            // Validate origin before any localStorage operation
            if (!this.validateOrigin(window.location.origin)) {
                console.error('localStorage access blocked: Invalid origin');
                return defaultValue;
            }

            const sanitizedKey = this.sanitizeStorageKey(key);
            const value = localStorage.getItem(sanitizedKey);

            if (value === null) {
                return defaultValue;
            }

            return JSON.parse(value);
        } catch (error) {
            console.error('Secure storage error:', this.sanitizeErrorMessage(error.message));
            return defaultValue;
        }
    },

    /**
     * Sanitize storage keys to prevent injection
     * @param {string} key - Storage key
     * @returns {string} Sanitized key
     */
    sanitizeStorageKey(key) {
        if (typeof key !== 'string') {
            key = String(key);
        }

        // Remove potentially dangerous characters
        return key
            .replace(/[<>\"']/g, '')
            .replace(/\.\./g, '')
            .substring(0, 200); // Reasonable key length limit
    },

    /**
     * Validate session token format
     * Even without authentication, validate token structure for future use
     * @param {string} token - Token to validate
     * @returns {boolean} True if token format is valid
     */
    validateSessionToken(token) {
        // Token must exist and be a string
        if (!token || typeof token !== 'string') {
            return false;
        }

        // Token must be alphanumeric only (prevents injection)
        // Typical JWT or session tokens are base64/alphanumeric
        const tokenPattern = /^[a-zA-Z0-9_-]+$/;
        if (!tokenPattern.test(token)) {
            return false;
        }

        // Reasonable length constraints (most session tokens are 16-128 chars)
        if (token.length < 16 || token.length > 512) {
            return false;
        }

        return true;
    },

    /**
     * Validate and parse JSON data safely
     * Handles malformed data gracefully
     * @param {string} jsonString - JSON string to parse
     * @param {Object} schema - Expected schema (optional)
     * @returns {Object|null} Parsed object or null if invalid
     */
    safeJSONParse(jsonString, schema = null) {
        try {
            const parsed = JSON.parse(jsonString);

            // If schema provided, validate structure
            if (schema) {
                return this.validateDataStructure(parsed, schema) ? parsed : null;
            }

            return parsed;
        } catch (error) {
            // JSON parsing failed - malformed data
            return null;
        }
    },

    /**
     * Validate data structure against schema
     * @param {*} data - Data to validate
     * @param {Object} schema - Expected schema
     * @returns {boolean} True if data matches schema
     */
    validateDataStructure(data, schema) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Example: validate that tiles is an array
        if (schema.tiles && !Array.isArray(data.tiles)) {
            return false;
        }

        // Validate required fields
        if (schema.required) {
            for (const field of schema.required) {
                if (!(field in data)) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * Sanitize input to prevent XSS
     * @param {string} input - User input
     * @returns {string} Sanitized input
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }

        // Remove script tags and event handlers
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<iframe/gi, '')
            .replace(/<object/gi, '')
            .replace(/<embed/gi, '');
    },

    /**
     * Validate tile coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if coordinates are valid
     */
    validateCoordinates(x, y) {
        return typeof x === 'number' &&
               typeof y === 'number' &&
               !isNaN(x) &&
               !isNaN(y) &&
               x >= 0 && x < 1000 &&
               y >= 0 && y < 1000;
    },

    /**
     * Validate lesson number
     * @param {number} lesson - Lesson number
     * @returns {boolean} True if lesson is valid
     */
    validateLesson(lesson) {
        return typeof lesson === 'number' &&
               lesson >= 1 &&
               lesson <= 13;
    },

    /**
     * Validate difficulty setting
     * @param {string} difficulty - Difficulty level
     * @returns {boolean} True if difficulty is valid
     */
    validateDifficulty(difficulty) {
        const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
        return validDifficulties.includes(difficulty);
    },

    /**
     * Create a Content Security Policy nonce for inline scripts
     * @returns {string} CSP nonce
     */
    generateCSPNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Check if running in secure context (HTTPS or localhost)
     * @returns {boolean} True if secure context
     */
    isSecureContext() {
        return window.isSecureContext ||
               window.location.protocol === 'https:' ||
               window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1';
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Security };
}

// Make available globally for use in application
if (typeof window !== 'undefined') {
    window.Security = Security;

    // Set up global security initialization on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSecurity);
    } else {
        initializeSecurity();
    }

    function initializeSecurity() {
        // Make security functions globally available for tests
        window.validateSessionToken = Security.validateSessionToken.bind(Security);
        window.safeJSONParse = Security.safeJSONParse.bind(Security);
        window.validateOrigin = Security.validateOrigin.bind(Security);

        // Note: We do NOT override textContent globally as it would break normal DOM operations
        // Instead, we provide Security.escapeHTML() for use in error handling
        // The application code should call Security.escapeHTML() before setting textContent
    }
}
