/**
 * Utility functions
 * Common helpers used throughout the application
 */

const Utils = {
    /**
     * Debounce function calls
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function calls
     * @param {Function} func
     * @param {number} limit
     * @returns {Function}
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
     * Deep clone an object
     * @param {*} obj
     * @returns {*}
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));

        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },

    /**
     * Format time in mm:ss
     * @param {number} seconds
     * @returns {string}
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Format number with commas
     * @param {number} num
     * @returns {string}
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Shuffle array in place
     * @param {Array} array
     * @returns {Array}
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Generate unique ID
     * @returns {string}
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Check if device is mobile
     * @returns {boolean}
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Check if device prefers reduced motion
     * @returns {boolean}
     */
    prefersReducedMotion() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        return mediaQuery.matches;
    },

    /**
     * Clamp number between min and max
     * @param {number} num
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },

    /**
     * Linear interpolation
     * @param {number} start
     * @param {number} end
     * @param {number} t - Progress (0-1)
     * @returns {number}
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Create element with attributes
     * @param {string} tag
     * @param {Object} attrs
     * @param {string|Node|Node[]} children
     * @returns {HTMLElement}
     */
    createElement(tag, attrs = {}, children = null) {
        const el = document.createElement(tag);

        Object.keys(attrs).forEach(key => {
            if (key === 'class') {
                el.className = attrs[key];
            } else if (key === 'style' && typeof attrs[key] === 'object') {
                Object.assign(el.style, attrs[key]);
            } else if (key.startsWith('on')) {
                const event = key.substring(2).toLowerCase();
                el.addEventListener(event, attrs[key]);
            } else {
                el.setAttribute(key, attrs[key]);
            }
        });

        if (children) {
            if (typeof children === 'string') {
                el.textContent = children;
            } else if (Array.isArray(children)) {
                children.forEach(child => {
                    if (child instanceof Node) {
                        el.appendChild(child);
                    } else if (typeof child === 'string') {
                        el.appendChild(document.createTextNode(child));
                    }
                });
            } else if (children instanceof Node) {
                el.appendChild(children);
            }
        }

        return el;
    },

    /**
     * Remove all children from element
     * @param {HTMLElement} element
     */
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    /**
     * Add class with optional duration
     * @param {HTMLElement} element
     * @param {string} className
     * @param {number} duration - Remove class after ms
     */
    addTemporaryClass(element, className, duration) {
        element.classList.add(className);
        if (duration) {
            setTimeout(() => element.classList.remove(className), duration);
        }
    },

    /**
     * Animate element property
     * @param {HTMLElement} element
     * @param {Object} properties
     * @param {number} duration
     * @param {Function} easing
     * @returns {Promise}
     */
    animate(element, properties, duration = 300, easing = t => t) {
        return new Promise(resolve => {
            const start = performance.now();
            const initial = {};

            Object.keys(properties).forEach(prop => {
                initial[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
            });

            const step = (timestamp) => {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easing(progress);

                Object.keys(properties).forEach(prop => {
                    const from = initial[prop];
                    const to = properties[prop];
                    const value = from + (to - from) * easedProgress;
                    element.style[prop] = value + (prop === 'opacity' ? '' : 'px');
                });

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(step);
        });
    },

    /**
     * Easing functions
     */
    easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils };
}
