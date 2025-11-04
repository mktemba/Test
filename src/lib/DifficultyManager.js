/**
 * DifficultyManager.js
 * Progressive difficulty system with adaptive challenge levels
 *
 * Manages difficulty progression through 4 tiers:
 * - Easy: 4 tiles, generous time
 * - Medium: 7 tiles, moderate time
 * - Hard: 9 tiles, challenging time
 * - Expert: 13 tiles, time pressure + complex patterns
 *
 * Performance targets:
 * - Difficulty calculation < 10ms
 * - Recommendation generation < 50ms
 *
 * @module DifficultyManager
 * @version 1.0.0
 */

/**
 * Difficulty level configurations
 *
 * TIME LIMIT RATIONALE:
 * Time limits are designed based on cognitive load theory and estimated tile processing time:
 * - Tile recognition: ~500ms per tile (beginner), ~200ms (expert)
 * - Decision making: ~2-3 seconds per decision
 * - Buffer for mistakes: 20-30% additional time
 *
 * DESIGN PROGRESSION (time per tile):
 * - Easy: 15 seconds/tile (60s / 4 tiles) - Generous learning pace
 * - Medium: 6.4 seconds/tile (45s / 7 tiles) - Comfortable practice pace
 * - Hard: 3.3 seconds/tile (30s / 9 tiles) - Challenging but achievable
 * - Expert: 1.5 seconds/tile (20s / 13 tiles) - Professional/competitive pace
 *
 * VALIDATION STATUS: ⚠️ Initial design values - REQUIRES USER TESTING
 * These values are based on:
 * - Analogous timing from similar puzzle games (Mahjong solitaire, memory games)
 * - General UX guidelines for timed challenges (Nielsen Norman Group)
 * - Educational game pacing research (Gee, 2007)
 *
 * RECOMMENDED TESTING:
 * - A/B test variants: ±25% time adjustment
 * - Track completion rates and user frustration signals
 * - Monitor difficulty transition timing
 * - Collect user feedback on "too easy" vs "too hard" feelings
 *
 * TODO: Update with actual user testing data when available
 */
const DIFFICULTY_CONFIGS = {
    easy: {
        name: 'Easy',
        tileCount: 4,
        timeLimit: 60000, // 60 seconds (15s per tile)
        hintsAllowed: 3,
        mistakesAllowed: 3,
        scoreMultiplier: 1.0,
        description: 'Learn the basics with fewer tiles and generous time',
        color: '#10b981', // green
        icon: '🌱'
    },
    medium: {
        name: 'Medium',
        tileCount: 7,
        timeLimit: 45000, // 45 seconds (6.4s per tile)
        hintsAllowed: 2,
        mistakesAllowed: 2,
        scoreMultiplier: 1.5,
        description: 'Standard difficulty for most learners',
        color: '#3b82f6', // blue
        icon: '⭐'
    },
    hard: {
        name: 'Hard',
        tileCount: 9,
        timeLimit: 30000, // 30 seconds (3.3s per tile)
        hintsAllowed: 1,
        mistakesAllowed: 1,
        scoreMultiplier: 2.0,
        description: 'Challenging exercises for advanced learners',
        color: '#f59e0b', // orange
        icon: '🔥'
    },
    expert: {
        name: 'Expert',
        tileCount: 13,
        timeLimit: 20000, // 20 seconds (1.5s per tile)
        hintsAllowed: 0,
        mistakesAllowed: 0,
        scoreMultiplier: 3.0,
        description: 'Master level with complex patterns and time pressure',
        color: '#ef4444', // red
        icon: '👑'
    }
};

/**
 * Performance thresholds for difficulty recommendations
 */
const PERFORMANCE_THRESHOLDS = {
    excellent: 0.90, // 90%+ accuracy
    good: 0.75,      // 75%+ accuracy
    fair: 0.60,      // 60%+ accuracy
    poor: 0.50       // Below 50%
};

/**
 * Minimum attempts before recommending difficulty change
 */
const MIN_ATTEMPTS_FOR_RECOMMENDATION = 3;

/**
 * DifficultyManager Class
 * Manages progressive difficulty and adaptive recommendations
 *
 * @class
 * @example
 * const difficultyManager = new DifficultyManager(dataManager);
 * const config = difficultyManager.getCurrentConfig();
 * difficultyManager.recordAttempt('medium', true, 45.2);
 */
class DifficultyManager {
    /**
     * Create a new DifficultyManager
     *
     * @param {Object} dataManager - DataManager instance for persistence
     */
    constructor(dataManager) {
        if (!dataManager) {
            throw new Error('DifficultyManager requires a DataManager instance');
        }

        this.dataManager = dataManager;
        this.currentDifficulty = this.dataManager.get('difficulty', 'medium');

        // Initialize performance tracking
        this.performanceHistory = this.dataManager.get('performanceHistory', {
            easy: [],
            medium: [],
            hard: [],
            expert: []
        });

        // Validate current difficulty
        if (!DIFFICULTY_CONFIGS[this.currentDifficulty]) {
            console.warn(`Invalid difficulty "${this.currentDifficulty}", resetting to medium`);
            this.currentDifficulty = 'medium';
            this.dataManager.set('difficulty', 'medium');
        }
    }

    /**
     * Get current difficulty level
     *
     * @returns {string} Current difficulty: 'easy', 'medium', 'hard', 'expert'
     */
    getCurrentDifficulty() {
        return this.currentDifficulty;
    }

    /**
     * Get configuration for current difficulty
     *
     * @returns {Object} Difficulty configuration object
     */
    getCurrentConfig() {
        return { ...DIFFICULTY_CONFIGS[this.currentDifficulty] };
    }

    /**
     * Get configuration for specific difficulty
     *
     * @param {string} difficulty - Difficulty level
     * @returns {Object|null} Difficulty configuration or null if invalid
     */
    getConfig(difficulty) {
        return DIFFICULTY_CONFIGS[difficulty] ? { ...DIFFICULTY_CONFIGS[difficulty] } : null;
    }

    /**
     * Get all available difficulty levels
     *
     * @returns {Array<Object>} Array of difficulty configurations
     */
    getAllDifficulties() {
        return Object.keys(DIFFICULTY_CONFIGS).map(key => ({
            key,
            ...DIFFICULTY_CONFIGS[key]
        }));
    }

    /**
     * Set difficulty level
     *
     * @param {string} difficulty - New difficulty level
     * @returns {boolean} Success status
     */
    setDifficulty(difficulty) {
        if (!DIFFICULTY_CONFIGS[difficulty]) {
            console.error(`Invalid difficulty level: ${difficulty}`);
            return false;
        }

        this.currentDifficulty = difficulty;
        this.dataManager.set('difficulty', difficulty);

        return true;
    }

    /**
     * Record a practice attempt
     *
     * @param {string} difficulty - Difficulty level of attempt
     * @param {boolean} success - Whether attempt was successful
     * @param {number} timeSpent - Time spent in seconds
     * @param {Object} metadata - Additional metadata (optional)
     * @returns {Object} Updated performance stats
     */
    recordAttempt(difficulty, success, timeSpent, metadata = {}) {
        if (!DIFFICULTY_CONFIGS[difficulty]) {
            console.error(`Invalid difficulty: ${difficulty}`);
            return null;
        }

        const attempt = {
            timestamp: Date.now(),
            success,
            timeSpent,
            accuracy: metadata.accuracy || (success ? 1.0 : 0.0),
            mistakes: metadata.mistakes || (success ? 0 : 1),
            hintsUsed: metadata.hintsUsed || 0,
            lessonId: metadata.lessonId || null
        };

        // Add to history (keep last 50 attempts per difficulty)
        if (!this.performanceHistory[difficulty]) {
            this.performanceHistory[difficulty] = [];
        }

        this.performanceHistory[difficulty].push(attempt);

        // Trim to last 50 attempts
        if (this.performanceHistory[difficulty].length > 50) {
            this.performanceHistory[difficulty] = this.performanceHistory[difficulty].slice(-50);
        }

        // Save to storage
        this.dataManager.set('performanceHistory', this.performanceHistory);

        // Calculate and return stats
        return this.getPerformanceStats(difficulty);
    }

    /**
     * Get performance statistics for a difficulty level
     *
     * @param {string} difficulty - Difficulty level
     * @returns {Object} Performance statistics
     */
    getPerformanceStats(difficulty) {
        const attempts = this.performanceHistory[difficulty] || [];

        if (attempts.length === 0) {
            return {
                attemptCount: 0,
                successRate: 0,
                averageAccuracy: 0,
                averageTime: 0,
                totalMistakes: 0,
                totalHintsUsed: 0,
                recentPerformance: 0
            };
        }

        const successCount = attempts.filter(a => a.success).length;
        const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
        const totalAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0);
        const totalMistakes = attempts.reduce((sum, a) => sum + a.mistakes, 0);
        const totalHints = attempts.reduce((sum, a) => sum + a.hintsUsed, 0);

        // Recent performance (last 5 attempts)
        const recentAttempts = attempts.slice(-5);
        const recentAccuracy = recentAttempts.reduce((sum, a) => sum + a.accuracy, 0) / recentAttempts.length;

        return {
            attemptCount: attempts.length,
            successRate: successCount / attempts.length,
            averageAccuracy: totalAccuracy / attempts.length,
            averageTime: totalTime / attempts.length,
            totalMistakes,
            totalHintsUsed: totalHints,
            recentPerformance: recentAccuracy
        };
    }

    /**
     * Get difficulty recommendation based on performance
     *
     * @returns {Object} Recommendation with suggested difficulty and reason
     */
    getRecommendation() {
        const currentStats = this.getPerformanceStats(this.currentDifficulty);

        // Not enough data yet
        if (currentStats.attemptCount < MIN_ATTEMPTS_FOR_RECOMMENDATION) {
            return {
                suggested: this.currentDifficulty,
                reason: `Complete ${MIN_ATTEMPTS_FOR_RECOMMENDATION - currentStats.attemptCount} more attempts for recommendation`,
                confidence: 'low',
                shouldChange: false
            };
        }

        // Check recent performance
        const recentPerf = currentStats.recentPerformance;
        const successRate = currentStats.successRate;

        // Excellent performance - suggest increasing difficulty
        if (recentPerf >= PERFORMANCE_THRESHOLDS.excellent && successRate >= PERFORMANCE_THRESHOLDS.excellent) {
            const nextDifficulty = this._getNextDifficulty(this.currentDifficulty);

            if (nextDifficulty !== this.currentDifficulty) {
                return {
                    suggested: nextDifficulty,
                    reason: `Excellent performance! Try ${DIFFICULTY_CONFIGS[nextDifficulty].name} difficulty`,
                    confidence: 'high',
                    shouldChange: true,
                    stats: currentStats
                };
            }
        }

        // Poor performance - suggest decreasing difficulty
        if (recentPerf < PERFORMANCE_THRESHOLDS.poor || successRate < PERFORMANCE_THRESHOLDS.poor) {
            const prevDifficulty = this._getPreviousDifficulty(this.currentDifficulty);

            if (prevDifficulty !== this.currentDifficulty) {
                return {
                    suggested: prevDifficulty,
                    reason: `Try ${DIFFICULTY_CONFIGS[prevDifficulty].name} difficulty to build confidence`,
                    confidence: 'high',
                    shouldChange: true,
                    stats: currentStats
                };
            }
        }

        // Good performance - stay at current level
        return {
            suggested: this.currentDifficulty,
            reason: `Keep practicing at ${DIFFICULTY_CONFIGS[this.currentDifficulty].name} level`,
            confidence: 'medium',
            shouldChange: false,
            stats: currentStats
        };
    }

    /**
     * Get next higher difficulty level
     *
     * @private
     * @param {string} current - Current difficulty
     * @returns {string} Next difficulty or current if at max
     */
    _getNextDifficulty(current) {
        const levels = ['easy', 'medium', 'hard', 'expert'];
        const currentIndex = levels.indexOf(current);

        if (currentIndex === -1 || currentIndex === levels.length - 1) {
            return current;
        }

        return levels[currentIndex + 1];
    }

    /**
     * Get previous lower difficulty level
     *
     * @private
     * @param {string} current - Current difficulty
     * @returns {string} Previous difficulty or current if at min
     */
    _getPreviousDifficulty(current) {
        const levels = ['easy', 'medium', 'hard', 'expert'];
        const currentIndex = levels.indexOf(current);

        if (currentIndex === -1 || currentIndex === 0) {
            return current;
        }

        return levels[currentIndex - 1];
    }

    /**
     * Automatically adjust difficulty based on performance
     *
     * @returns {Object} Result of auto-adjustment
     */
    autoAdjustDifficulty() {
        const recommendation = this.getRecommendation();

        if (recommendation.shouldChange && recommendation.confidence === 'high') {
            this.setDifficulty(recommendation.suggested);

            return {
                changed: true,
                from: this.currentDifficulty,
                to: recommendation.suggested,
                reason: recommendation.reason
            };
        }

        return {
            changed: false,
            current: this.currentDifficulty,
            reason: recommendation.reason
        };
    }

    /**
     * Get appropriate exercise configuration for current difficulty
     *
     * @param {string} exerciseType - Type of exercise
     * @returns {Object} Exercise configuration
     */
    getExerciseConfig(exerciseType) {
        const config = this.getCurrentConfig();

        return {
            tileCount: config.tileCount,
            timeLimit: config.timeLimit,
            hintsAllowed: config.hintsAllowed,
            mistakesAllowed: config.mistakesAllowed,
            scoreMultiplier: config.scoreMultiplier,
            difficulty: this.currentDifficulty,
            exerciseType
        };
    }

    /**
     * Calculate score based on difficulty and performance
     *
     * @param {number} baseScore - Base score before multipliers
     * @param {Object} performance - Performance metrics
     * @returns {number} Final calculated score
     */
    calculateScore(baseScore, performance = {}) {
        const config = this.getCurrentConfig();
        let score = baseScore * config.scoreMultiplier;

        // Bonus for no hints used
        if (config.hintsAllowed > 0 && performance.hintsUsed === 0) {
            score *= 1.2;
        }

        // Time bonus (completed in less than half the time limit)
        if (performance.timeSpent && performance.timeSpent < config.timeLimit / 2) {
            score *= 1.3;
        }

        // Perfect accuracy bonus
        if (performance.accuracy === 1.0) {
            score *= 1.5;
        }

        return Math.round(score);
    }

    /**
     * Reset all performance history
     */
    resetPerformanceHistory() {
        this.performanceHistory = {
            easy: [],
            medium: [],
            hard: [],
            expert: []
        };

        this.dataManager.set('performanceHistory', this.performanceHistory);
    }

    /**
     * Export performance data
     *
     * @returns {Object} Complete performance history
     */
    exportData() {
        return {
            currentDifficulty: this.currentDifficulty,
            performanceHistory: this.performanceHistory,
            stats: {
                easy: this.getPerformanceStats('easy'),
                medium: this.getPerformanceStats('medium'),
                hard: this.getPerformanceStats('hard'),
                expert: this.getPerformanceStats('expert')
            }
        };
    }

    /**
     * Get performance trend (improving, declining, stable)
     *
     * @param {string} difficulty - Difficulty level
     * @returns {Object} Trend analysis
     */
    getPerformanceTrend(difficulty) {
        const attempts = this.performanceHistory[difficulty] || [];

        if (attempts.length < 5) {
            return {
                trend: 'insufficient_data',
                message: 'Not enough attempts to determine trend'
            };
        }

        // Compare first half vs second half accuracy
        const midpoint = Math.floor(attempts.length / 2);
        const firstHalf = attempts.slice(0, midpoint);
        const secondHalf = attempts.slice(midpoint);

        const firstAvg = firstHalf.reduce((sum, a) => sum + a.accuracy, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, a) => sum + a.accuracy, 0) / secondHalf.length;

        const improvement = secondAvg - firstAvg;

        if (improvement > 0.1) {
            return {
                trend: 'improving',
                message: 'Your performance is improving!',
                improvement: Math.round(improvement * 100)
            };
        } else if (improvement < -0.1) {
            return {
                trend: 'declining',
                message: 'Consider reviewing lesson material',
                decline: Math.round(Math.abs(improvement) * 100)
            };
        } else {
            return {
                trend: 'stable',
                message: 'Your performance is consistent',
                stability: Math.round((1 - Math.abs(improvement)) * 100)
            };
        }
    }
}

/**
 * Export for use in other modules
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DifficultyManager,
        DIFFICULTY_CONFIGS,
        PERFORMANCE_THRESHOLDS
    };
}


// ES6 module export (for import statements)
export { DifficultyManager, DIFFICULTY_CONFIGS, PERFORMANCE_THRESHOLDS };

// Browser global export
if (typeof window !== 'undefined') {
    window.DifficultyManager = DifficultyManager;
}
