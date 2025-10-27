/**
 * Data management and persistence layer
 * Similar to data.ts in online-go.com
 * Handles localStorage, preferences, and game data
 */

class DataManager {
    constructor() {
        this.storage = window.localStorage;
        this.prefix = 'mahjong_';
        this.cache = new Map();
    }

    /**
     * Get value from storage
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    get(key, defaultValue = null) {
        const fullKey = this.prefix + key;

        if (this.cache.has(fullKey)) {
            return this.cache.get(fullKey);
        }

        try {
            const value = this.storage.getItem(fullKey);
            if (value === null) return defaultValue;

            const parsed = JSON.parse(value);
            this.cache.set(fullKey, parsed);
            return parsed;
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Set value in storage
     * @param {string} key
     * @param {*} value
     * @returns {boolean} Success status
     */
    set(key, value) {
        const fullKey = this.prefix + key;

        try {
            const serialized = JSON.stringify(value);
            this.storage.setItem(fullKey, serialized);
            this.cache.set(fullKey, value);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded. Unable to save data.');
                this.emit('storageQuotaExceeded', { key, error });
                // TODO: Implement LRU cache cleanup or user notification
                return false;
            } else {
                console.error(`Error writing ${key}:`, error);
                return false;
            }
        }
    }

    /**
     * Event emission for storage errors
     * @param {string} event
     * @param {Object} data
     */
    emit(event, data) {
        // Simple event emission for storage errors
        // Can be extended with proper event listener system if needed
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent(`mahjong_${event}`, { detail: data }));
        }
    }

    /**
     * Remove value from storage
     * @param {string} key
     */
    remove(key) {
        const fullKey = this.prefix + key;
        this.storage.removeItem(fullKey);
        this.cache.delete(fullKey);
    }

    /**
     * Check if key exists
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return this.storage.getItem(this.prefix + key) !== null;
    }

    /**
     * Clear all game data
     */
    clearAll() {
        const keys = [];
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keys.push(key);
            }
        }

        keys.forEach(key => this.storage.removeItem(key));
        this.cache.clear();
    }

    /**
     * Get all keys with prefix
     * @returns {string[]}
     */
    getAllKeys() {
        const keys = [];
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keys.push(key.substring(this.prefix.length));
            }
        }
        return keys;
    }

    /**
     * Export all data
     * @returns {Object}
     */
    exportData() {
        const data = {};
        this.getAllKeys().forEach(key => {
            data[key] = this.get(key);
        });
        return data;
    }

    /**
     * Import data
     * @param {Object} data
     */
    importData(data) {
        Object.keys(data).forEach(key => {
            this.set(key, data[key]);
        });
    }
}

// Singleton instance
const data = new DataManager();

/**
 * Game-specific data accessors
 */
const GameData = {
    /**
     * Save current game state
     * @param {Object} state
     */
    saveGame(state) {
        data.set('current_game', state);
        data.set('last_save_time', Date.now());
    },

    /**
     * Load saved game state
     * @returns {Object|null}
     */
    loadGame() {
        return data.get('current_game', null);
    },

    /**
     * Check if saved game exists
     * @returns {boolean}
     */
    hasSavedGame() {
        return data.has('current_game');
    },

    /**
     * Delete saved game
     */
    deleteSavedGame() {
        data.remove('current_game');
        data.remove('last_save_time');
    },

    /**
     * Get last save timestamp
     * @returns {number|null}
     */
    getLastSaveTime() {
        return data.get('last_save_time', null);
    },

    /**
     * Save game statistics
     * @param {Object} stats
     */
    saveStats(stats) {
        const existing = this.getStats();
        const updated = Object.assign({}, existing, stats);
        data.set('stats', updated);
    },

    /**
     * Get game statistics
     * @returns {Object}
     */
    getStats() {
        return data.get('stats', {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            bestScore: 0,
            lessonsCompleted: [],
            // New fields for enhanced features
            difficulty: 'medium',
            totalTime: 0,
            sessionStart: null,
            accuracyByLesson: {},
            scenariosCompleted: [],
            audioEnabled: true
        });
    },

    /**
     * Record game completion
     * @param {boolean} won
     * @param {number} score
     */
    recordGame(won, score) {
        const stats = this.getStats();
        stats.gamesPlayed++;

        if (won) {
            stats.gamesWon++;
        }

        stats.totalScore += score;
        stats.bestScore = Math.max(stats.bestScore, score);

        this.saveStats(stats);
    },

    /**
     * Mark lesson as completed
     * @param {number} lessonId
     */
    completeLesson(lessonId) {
        const stats = this.getStats();
        if (!stats.lessonsCompleted.includes(lessonId)) {
            stats.lessonsCompleted.push(lessonId);
            this.saveStats(stats);
        }
    },

    /**
     * Check if lesson is completed
     * @param {number} lessonId
     * @returns {boolean}
     */
    isLessonCompleted(lessonId) {
        const stats = this.getStats();
        return stats.lessonsCompleted.includes(lessonId);
    },

    /**
     * Get completion percentage
     * @param {number} totalLessons
     * @returns {number}
     */
    getCompletionPercentage(totalLessons) {
        const stats = this.getStats();
        return (stats.lessonsCompleted.length / totalLessons) * 100;
    },

    /**
     * Get difficulty setting
     * @returns {string}
     */
    getDifficulty() {
        const stats = this.getStats();
        return stats.difficulty || 'medium';
    },

    /**
     * Set difficulty setting
     * @param {string} difficulty
     */
    setDifficulty(difficulty) {
        const stats = this.getStats();
        stats.difficulty = difficulty;
        this.saveStats(stats);
    },

    /**
     * Track lesson accuracy
     * @param {string} lessonId
     * @param {number} accuracy
     * @param {Object} details
     */
    trackLessonAccuracy(lessonId, accuracy, details = {}) {
        const stats = this.getStats();
        if (!stats.accuracyByLesson) {
            stats.accuracyByLesson = {};
        }
        if (!stats.accuracyByLesson[lessonId]) {
            stats.accuracyByLesson[lessonId] = [];
        }

        stats.accuracyByLesson[lessonId].push({
            timestamp: Date.now(),
            accuracy,
            ...details
        });

        this.saveStats(stats);
    },

    /**
     * Get accuracy for lesson
     * @param {string} lessonId
     * @returns {Array}
     */
    getLessonAccuracy(lessonId) {
        const stats = this.getStats();
        return (stats.accuracyByLesson && stats.accuracyByLesson[lessonId]) || [];
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { data, DataManager, GameData };
}
