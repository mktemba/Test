/**
 * MistakeAnalyzer.js
 * Comprehensive mistake tracking and analysis system
 *
 * Features:
 * - Track mistakes by type (confused tiles, wrong patterns, timing)
 * - Analyze patterns and frequency
 * - Generate targeted practice recommendations
 * - Show common mistakes summary
 * - Track improvement over time
 *
 * Performance targets:
 * - Mistake logging < 5ms
 * - Analysis computation < 100ms
 * - Recommendation generation < 50ms
 *
 * @module MistakeAnalyzer
 * @version 1.0.0
 */

/**
 * Mistake type categories
 */
const MISTAKE_TYPES = {
    CONFUSED_TILES: {
        id: 'confused_tiles',
        name: 'Confused Tiles',
        description: 'Mixed up similar-looking tiles',
        severity: 'medium',
        icon: '🔄'
    },
    WRONG_PATTERN: {
        id: 'wrong_pattern',
        name: 'Wrong Pattern',
        description: 'Identified incorrect winning pattern',
        severity: 'high',
        icon: '❌'
    },
    MISSED_OPPORTUNITY: {
        id: 'missed_opportunity',
        name: 'Missed Opportunity',
        description: 'Failed to recognize valid move',
        severity: 'medium',
        icon: '⚠️'
    },
    TIMING_ERROR: {
        id: 'timing_error',
        name: 'Timing Error',
        description: 'Ran out of time or rushed answer',
        severity: 'low',
        icon: '⏱️'
    },
    RULE_VIOLATION: {
        id: 'rule_violation',
        name: 'Rule Violation',
        description: 'Attempted invalid move per Mahjong rules',
        severity: 'high',
        icon: '🚫'
    },
    COUNTING_ERROR: {
        id: 'counting_error',
        name: 'Counting Error',
        description: 'Miscounted tiles or points',
        severity: 'medium',
        icon: '🔢'
    }
};

/**
 * Tile confusion pairs (commonly confused tiles)
 */
const COMMON_CONFUSIONS = [
    ['bamboo-1', 'bamboo-8'], // Similar visual appearance
    ['dots-1', 'dots-9'],
    ['characters-2', 'characters-3'],
    ['wind-east', 'wind-west'],
    ['dragon-green', 'bamboo-8']
];

/**
 * MistakeAnalyzer Class
 * Tracks and analyzes user mistakes for personalized learning
 *
 * @class
 * @example
 * const analyzer = new MistakeAnalyzer(dataManager);
 * analyzer.recordMistake(MISTAKE_TYPES.CONFUSED_TILES, {
 *   expectedTile: 'bamboo-3',
 *   selectedTile: 'bamboo-8',
 *   lessonId: 5
 * });
 */
class MistakeAnalyzer {
    /**
     * Create a new MistakeAnalyzer
     *
     * @param {Object} dataManager - DataManager instance for persistence
     */
    constructor(dataManager) {
        if (!dataManager) {
            throw new Error('MistakeAnalyzer requires a DataManager instance');
        }

        this.dataManager = dataManager;

        // Load existing mistakes from storage
        this.mistakes = this.dataManager.get('mistakes', {
            history: [],
            byType: {},
            byLesson: {},
            tileConfusions: {},
            patternErrors: {}
        });

        // Initialize mistake type tracking
        Object.keys(MISTAKE_TYPES).forEach(key => {
            const typeId = MISTAKE_TYPES[key].id;
            if (!this.mistakes.byType[typeId]) {
                this.mistakes.byType[typeId] = [];
            }
        });
    }

    /**
     * Record a mistake
     *
     * @param {Object} mistakeType - Mistake type from MISTAKE_TYPES
     * @param {Object} details - Mistake details
     * @param {string} details.lessonId - Lesson where mistake occurred
     * @param {string} details.exerciseId - Exercise identifier
     * @param {string} details.expectedTile - Expected correct tile (optional)
     * @param {string} details.selectedTile - User's selected tile (optional)
     * @param {string} details.expectedPattern - Expected pattern (optional)
     * @param {string} details.description - Human-readable description
     * @returns {Object} Recorded mistake object
     */
    recordMistake(mistakeType, details = {}) {
        if (!mistakeType || !mistakeType.id) {
            console.error('Invalid mistake type');
            return null;
        }

        const mistake = {
            id: `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: mistakeType.id,
            timestamp: Date.now(),
            lessonId: details.lessonId || null,
            exerciseId: details.exerciseId || null,
            expectedTile: details.expectedTile || null,
            selectedTile: details.selectedTile || null,
            expectedPattern: details.expectedPattern || null,
            description: details.description || mistakeType.description,
            context: details.context || {},
            reviewed: false
        };

        // Add to history (keep last 200 mistakes)
        this.mistakes.history.push(mistake);
        if (this.mistakes.history.length > 200) {
            this.mistakes.history = this.mistakes.history.slice(-200);
        }

        // Add to type-specific tracking
        if (!this.mistakes.byType[mistakeType.id]) {
            this.mistakes.byType[mistakeType.id] = [];
        }
        this.mistakes.byType[mistakeType.id].push(mistake);

        // Add to lesson-specific tracking
        if (details.lessonId) {
            if (!this.mistakes.byLesson[details.lessonId]) {
                this.mistakes.byLesson[details.lessonId] = [];
            }
            this.mistakes.byLesson[details.lessonId].push(mistake);
        }

        // Track tile confusions
        if (details.expectedTile && details.selectedTile) {
            const confusionKey = `${details.expectedTile}:${details.selectedTile}`;
            this.mistakes.tileConfusions[confusionKey] =
                (this.mistakes.tileConfusions[confusionKey] || 0) + 1;
        }

        // Track pattern errors
        if (details.expectedPattern) {
            if (!this.mistakes.patternErrors[details.expectedPattern]) {
                this.mistakes.patternErrors[details.expectedPattern] = 0;
            }
            this.mistakes.patternErrors[details.expectedPattern]++;
        }

        // Persist to storage
        this._save();

        return mistake;
    }

    /**
     * Get all mistakes
     *
     * @param {Object} filters - Filter options
     * @param {string} filters.type - Filter by mistake type
     * @param {string} filters.lessonId - Filter by lesson
     * @param {number} filters.since - Timestamp to filter from
     * @param {number} filters.limit - Maximum number of results
     * @returns {Array<Object>} Filtered mistakes
     */
    getMistakes(filters = {}) {
        let mistakes = [...this.mistakes.history];

        // Apply filters
        if (filters.type) {
            mistakes = mistakes.filter(m => m.type === filters.type);
        }

        if (filters.lessonId) {
            mistakes = mistakes.filter(m => m.lessonId === filters.lessonId);
        }

        if (filters.since) {
            mistakes = mistakes.filter(m => m.timestamp >= filters.since);
        }

        // Sort by timestamp (most recent first)
        mistakes.sort((a, b) => b.timestamp - a.timestamp);

        // Apply limit
        if (filters.limit) {
            mistakes = mistakes.slice(0, filters.limit);
        }

        return mistakes;
    }

    /**
     * Get mistake statistics
     *
     * @returns {Object} Comprehensive statistics
     */
    getStats() {
        const totalMistakes = this.mistakes.history.length;

        if (totalMistakes === 0) {
            return {
                totalMistakes: 0,
                byType: {},
                mostCommonType: null,
                averagePerLesson: 0,
                improvementRate: 0
            };
        }

        // Calculate mistakes by type
        const byType = {};
        Object.keys(this.mistakes.byType).forEach(typeId => {
            const count = this.mistakes.byType[typeId].length;
            if (count > 0) {
                byType[typeId] = {
                    count,
                    percentage: (count / totalMistakes) * 100,
                    type: Object.values(MISTAKE_TYPES).find(t => t.id === typeId)
                };
            }
        });

        // Find most common mistake type
        const mostCommonType = Object.entries(byType)
            .sort((a, b) => b[1].count - a[1].count)[0];

        // Calculate average mistakes per lesson
        const lessonsWithMistakes = Object.keys(this.mistakes.byLesson).length;
        const averagePerLesson = lessonsWithMistakes > 0
            ? totalMistakes / lessonsWithMistakes
            : 0;

        // Calculate improvement rate (comparing recent vs older mistakes)
        const improvementRate = this._calculateImprovementRate();

        return {
            totalMistakes,
            byType,
            mostCommonType: mostCommonType ? mostCommonType[1] : null,
            averagePerLesson: Math.round(averagePerLesson * 10) / 10,
            improvementRate
        };
    }

    /**
     * Calculate improvement rate
     *
     * @private
     * @returns {number} Improvement rate (-100 to 100, positive is better)
     */
    _calculateImprovementRate() {
        if (this.mistakes.history.length < 10) {
            return 0; // Not enough data
        }

        const midpoint = Math.floor(this.mistakes.history.length / 2);
        const olderMistakes = this.mistakes.history.slice(0, midpoint);
        const recentMistakes = this.mistakes.history.slice(midpoint);

        // Calculate mistake rate (mistakes per day)
        const olderDays = this._getDaySpan(olderMistakes);
        const recentDays = this._getDaySpan(recentMistakes);

        if (olderDays === 0 || recentDays === 0) {
            return 0;
        }

        const olderRate = olderMistakes.length / olderDays;
        const recentRate = recentMistakes.length / recentDays;

        // Calculate improvement (positive means fewer mistakes recently)
        const improvement = ((olderRate - recentRate) / olderRate) * 100;

        return Math.round(improvement);
    }

    /**
     * Get day span for mistakes
     *
     * @private
     * @param {Array<Object>} mistakes - Array of mistakes
     * @returns {number} Number of days spanned
     */
    _getDaySpan(mistakes) {
        if (mistakes.length === 0) return 0;

        const timestamps = mistakes.map(m => m.timestamp);
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);
        const daySpan = (maxTime - minTime) / (1000 * 60 * 60 * 24);

        return Math.max(daySpan, 1); // At least 1 day
    }

    /**
     * Get most confused tile pairs
     *
     * @param {number} limit - Maximum number of pairs to return
     * @returns {Array<Object>} Most confused tile pairs
     */
    getMostConfusedTiles(limit = 5) {
        const confusions = Object.entries(this.mistakes.tileConfusions)
            .map(([key, count]) => {
                const [expected, selected] = key.split(':');
                return { expected, selected, count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        return confusions;
    }

    /**
     * Get lessons with most mistakes
     *
     * @param {number} limit - Maximum number of lessons to return
     * @returns {Array<Object>} Lessons with mistake counts
     */
    getProblematicLessons(limit = 5) {
        const lessons = Object.entries(this.mistakes.byLesson)
            .map(([lessonId, mistakes]) => ({
                lessonId,
                mistakeCount: mistakes.length,
                mistakes
            }))
            .sort((a, b) => b.mistakeCount - a.mistakeCount)
            .slice(0, limit);

        return lessons;
    }

    /**
     * Generate personalized practice recommendations
     *
     * @returns {Array<Object>} Array of recommendations
     */
    getRecommendations() {
        const recommendations = [];
        const stats = this.getStats();

        if (stats.totalMistakes === 0) {
            return [{
                priority: 'low',
                title: 'Keep Learning',
                description: 'Continue with the next lessons',
                action: 'continue'
            }];
        }

        // Recommendation 1: Most common mistake type
        if (stats.mostCommonType) {
            const type = stats.mostCommonType.type;
            recommendations.push({
                priority: type.severity,
                title: `Practice: ${type.name}`,
                description: `You've made ${stats.mostCommonType.count} ${type.name.toLowerCase()} mistakes. Let's focus on this area.`,
                action: 'practice_type',
                data: { mistakeType: type.id },
                icon: type.icon
            });
        }

        // Recommendation 2: Confused tiles
        const confusedTiles = this.getMostConfusedTiles(1);
        if (confusedTiles.length > 0) {
            const confusion = confusedTiles[0];
            recommendations.push({
                priority: 'medium',
                title: 'Tile Recognition Practice',
                description: `You've confused ${confusion.expected} with ${confusion.selected} ${confusion.count} times. Practice identifying these tiles.`,
                action: 'practice_tiles',
                data: { tiles: [confusion.expected, confusion.selected] },
                icon: '🔄'
            });
        }

        // Recommendation 3: Problematic lessons
        const problematicLessons = this.getProblematicLessons(1);
        if (problematicLessons.length > 0) {
            const lesson = problematicLessons[0];
            recommendations.push({
                priority: 'high',
                title: `Review Lesson ${lesson.lessonId}`,
                description: `You've made ${lesson.mistakeCount} mistakes in this lesson. Consider reviewing it.`,
                action: 'review_lesson',
                data: { lessonId: lesson.lessonId },
                icon: '📚'
            });
        }

        // Recommendation 4: Improvement encouragement
        if (stats.improvementRate > 20) {
            recommendations.push({
                priority: 'low',
                title: 'Great Progress!',
                description: `You're making ${stats.improvementRate}% fewer mistakes. Keep it up!`,
                action: 'continue',
                icon: '🎉'
            });
        } else if (stats.improvementRate < -20) {
            recommendations.push({
                priority: 'high',
                title: 'Take a Break',
                description: 'Your mistake rate is increasing. Consider taking a short break and reviewing fundamentals.',
                action: 'take_break',
                icon: '☕'
            });
        }

        // Sort by priority
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        recommendations.sort((a, b) =>
            priorityOrder[a.priority] - priorityOrder[b.priority]
        );

        return recommendations;
    }

    /**
     * Mark mistake as reviewed
     *
     * @param {string} mistakeId - Mistake identifier
     * @returns {boolean} Success status
     */
    markAsReviewed(mistakeId) {
        const mistake = this.mistakes.history.find(m => m.id === mistakeId);

        if (mistake) {
            mistake.reviewed = true;
            this._save();
            return true;
        }

        return false;
    }

    /**
     * Get common mistakes summary for display
     *
     * @returns {Object} Summary object with charts data
     */
    getCommonMistakesSummary() {
        const stats = this.getStats();
        const confusedTiles = this.getMostConfusedTiles(3);
        const problematicLessons = this.getProblematicLessons(3);

        return {
            overview: {
                totalMistakes: stats.totalMistakes,
                improvementRate: stats.improvementRate,
                averagePerLesson: stats.averagePerLesson
            },
            byType: stats.byType,
            confusedTiles,
            problematicLessons,
            recentMistakes: this.getMistakes({ limit: 5 }),
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get mistake trend over time
     *
     * @param {number} days - Number of days to analyze
     * @returns {Array<Object>} Trend data by day
     */
    getMistakeTrend(days = 7) {
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const trend = [];

        for (let i = days - 1; i >= 0; i--) {
            const dayStart = now - (i * dayMs);
            const dayEnd = dayStart + dayMs;

            const dayMistakes = this.mistakes.history.filter(m =>
                m.timestamp >= dayStart && m.timestamp < dayEnd
            );

            trend.push({
                date: new Date(dayStart),
                count: dayMistakes.length,
                types: this._groupByType(dayMistakes)
            });
        }

        return trend;
    }

    /**
     * Group mistakes by type
     *
     * @private
     * @param {Array<Object>} mistakes - Array of mistakes
     * @returns {Object} Mistakes grouped by type
     */
    _groupByType(mistakes) {
        const grouped = {};

        mistakes.forEach(mistake => {
            if (!grouped[mistake.type]) {
                grouped[mistake.type] = 0;
            }
            grouped[mistake.type]++;
        });

        return grouped;
    }

    /**
     * Clear all mistakes
     */
    clearAllMistakes() {
        this.mistakes = {
            history: [],
            byType: {},
            byLesson: {},
            tileConfusions: {},
            patternErrors: {}
        };

        this._save();
    }

    /**
     * Clear mistakes for specific lesson
     *
     * @param {string} lessonId - Lesson identifier
     */
    clearLessonMistakes(lessonId) {
        this.mistakes.history = this.mistakes.history.filter(m =>
            m.lessonId !== lessonId
        );

        delete this.mistakes.byLesson[lessonId];

        this._save();
    }

    /**
     * Export mistakes data
     *
     * @returns {Object} Complete mistakes data
     */
    exportData() {
        return {
            mistakes: this.mistakes,
            stats: this.getStats(),
            recommendations: this.getRecommendations(),
            summary: this.getCommonMistakesSummary()
        };
    }

    /**
     * Save mistakes to storage
     *
     * @private
     */
    _save() {
        this.dataManager.set('mistakes', this.mistakes);
    }
}

/**
 * Export for use in other modules
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MistakeAnalyzer,
        MISTAKE_TYPES,
        COMMON_CONFUSIONS
    };
}

// Browser global export
if (typeof window !== 'undefined') {
    window.MistakeAnalyzer = MistakeAnalyzer;
    window.MISTAKE_TYPES = MISTAKE_TYPES;
}
