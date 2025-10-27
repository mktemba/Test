/**
 * ProgressAnalyzer.js
 * Enhanced progress tracking and analytics dashboard
 *
 * Features:
 * - Time tracking (total learning time, session duration)
 * - Accuracy metrics by lesson
 * - Skills mastery matrix
 * - Progress graphs and visualizations
 * - Personalized recommendations
 *
 * Performance targets:
 * - Dashboard data computation < 200ms
 * - Chart data generation < 100ms
 * - Recommendation engine < 50ms
 *
 * @module ProgressAnalyzer
 * @version 1.0.0
 */

/**
 * Skill categories for mastery tracking
 */
const SKILL_CATEGORIES = {
    TILE_RECOGNITION: {
        id: 'tile_recognition',
        name: 'Tile Recognition',
        description: 'Ability to identify and distinguish Mahjong tiles',
        icon: '👁️',
        lessons: [1, 2, 3]
    },
    PATTERN_MATCHING: {
        id: 'pattern_matching',
        name: 'Pattern Matching',
        description: 'Recognizing sequences and sets',
        icon: '🧩',
        lessons: [4, 5, 6]
    },
    WINNING_HANDS: {
        id: 'winning_hands',
        name: 'Winning Hands',
        description: 'Identifying complete winning combinations',
        icon: '🏆',
        lessons: [7, 8, 9]
    },
    STRATEGY: {
        id: 'strategy',
        name: 'Strategy',
        description: 'Game strategy and decision making',
        icon: '🎯',
        lessons: [10, 11, 12]
    },
    ADVANCED_PLAY: {
        id: 'advanced_play',
        name: 'Advanced Play',
        description: 'Expert techniques and scoring',
        icon: '⚡',
        lessons: [13]
    }
};

/**
 * Achievement definitions
 */
const ACHIEVEMENTS = [
    {
        id: 'first_lesson',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🌟',
        requirement: { type: 'lessons_completed', value: 1 }
    },
    {
        id: 'five_lessons',
        name: 'Quick Learner',
        description: 'Complete 5 lessons',
        icon: '📚',
        requirement: { type: 'lessons_completed', value: 5 }
    },
    {
        id: 'all_lessons',
        name: 'Scholar',
        description: 'Complete all lessons',
        icon: '🎓',
        requirement: { type: 'lessons_completed', value: 13 }
    },
    {
        id: 'perfect_exercise',
        name: 'Perfect Score',
        description: 'Get 100% on an exercise',
        icon: '💯',
        requirement: { type: 'perfect_accuracy', value: 1 }
    },
    {
        id: 'ten_scenarios',
        name: 'Strategist',
        description: 'Complete 10 scenarios',
        icon: '🧠',
        requirement: { type: 'scenarios_completed', value: 10 }
    },
    {
        id: 'one_hour',
        name: 'Dedicated',
        description: 'Study for 1 hour total',
        icon: '⏰',
        requirement: { type: 'total_time', value: 3600000 } // 1 hour in ms
    },
    {
        id: 'three_hours',
        name: 'Committed',
        description: 'Study for 3 hours total',
        icon: '⏱️',
        requirement: { type: 'total_time', value: 10800000 } // 3 hours in ms
    },
    {
        id: 'no_mistakes',
        name: 'Flawless',
        description: 'Complete 5 exercises with no mistakes',
        icon: '✨',
        requirement: { type: 'flawless_exercises', value: 5 }
    },
    {
        id: 'comeback',
        name: 'Comeback Kid',
        description: 'Improve mistake rate by 50%',
        icon: '📈',
        requirement: { type: 'improvement_rate', value: 50 }
    },
    {
        id: 'expert_difficulty',
        name: 'Master',
        description: 'Complete 10 exercises on expert difficulty',
        icon: '👑',
        requirement: { type: 'expert_exercises', value: 10 }
    }
];

/**
 * Mastery level thresholds
 */
const MASTERY_LEVELS = {
    NOVICE: { threshold: 0, name: 'Novice', color: '#9ca3af' },
    BEGINNER: { threshold: 25, name: 'Beginner', color: '#60a5fa' },
    INTERMEDIATE: { threshold: 50, name: 'Intermediate', color: '#34d399' },
    ADVANCED: { threshold: 75, name: 'Advanced', color: '#fbbf24' },
    EXPERT: { threshold: 90, name: 'Expert', color: '#f87171' },
    MASTER: { threshold: 98, name: 'Master', color: '#a78bfa' }
};

/**
 * ProgressAnalyzer Class
 * Comprehensive progress tracking and analytics
 *
 * @class
 * @example
 * const analyzer = new ProgressAnalyzer(dataManager, gameData);
 * const dashboard = analyzer.getDashboardData();
 * analyzer.trackSessionStart();
 */
class ProgressAnalyzer {
    /**
     * Create a new ProgressAnalyzer
     *
     * @param {Object} dataManager - DataManager instance
     * @param {Object} gameData - GameData instance
     */
    constructor(dataManager, gameData) {
        if (!dataManager) {
            throw new Error('ProgressAnalyzer requires a DataManager instance');
        }

        this.dataManager = dataManager;
        this.gameData = gameData;

        // Load progress data
        this.progressData = this.dataManager.get('progressData', {
            totalTime: 0,
            sessionStart: null,
            accuracyByLesson: {},
            practiceAttempts: [],
            achievements: [],
            skillMastery: {},
            dailyActivity: {},
            streakDays: 0,
            lastActiveDate: null
        });

        // Initialize skill mastery
        Object.keys(SKILL_CATEGORIES).forEach(key => {
            const skillId = SKILL_CATEGORIES[key].id;
            if (!this.progressData.skillMastery[skillId]) {
                this.progressData.skillMastery[skillId] = {
                    level: 0,
                    attempts: 0,
                    successes: 0
                };
            }
        });
    }

    /**
     * Start a learning session
     */
    trackSessionStart() {
        this.progressData.sessionStart = Date.now();
        this._updateDailyActivity();
        this._updateStreak();
        this._save();
    }

    /**
     * End a learning session
     *
     * @returns {number} Session duration in milliseconds
     */
    trackSessionEnd() {
        if (!this.progressData.sessionStart) {
            return 0;
        }

        const sessionDuration = Date.now() - this.progressData.sessionStart;
        this.progressData.totalTime += sessionDuration;
        this.progressData.sessionStart = null;

        this._save();

        return sessionDuration;
    }

    /**
     * Track lesson accuracy
     *
     * @param {string} lessonId - Lesson identifier
     * @param {number} accuracy - Accuracy percentage (0-100)
     * @param {Object} details - Additional details
     */
    trackLessonAccuracy(lessonId, accuracy, details = {}) {
        if (!this.progressData.accuracyByLesson[lessonId]) {
            this.progressData.accuracyByLesson[lessonId] = [];
        }

        this.progressData.accuracyByLesson[lessonId].push({
            timestamp: Date.now(),
            accuracy,
            timeSpent: details.timeSpent || 0,
            mistakes: details.mistakes || 0,
            difficulty: details.difficulty || 'medium'
        });

        // Update skill mastery for relevant skills
        this._updateSkillMastery(lessonId, accuracy);

        // Check for achievements
        this._checkAchievements();

        this._save();
    }

    /**
     * Record practice attempt
     *
     * @param {Object} attempt - Attempt details
     */
    recordPracticeAttempt(attempt) {
        this.progressData.practiceAttempts.push({
            timestamp: Date.now(),
            ...attempt
        });

        // Keep last 100 attempts
        if (this.progressData.practiceAttempts.length > 100) {
            this.progressData.practiceAttempts = this.progressData.practiceAttempts.slice(-100);
        }

        this._save();
    }

    /**
     * Get comprehensive dashboard data
     *
     * @returns {Object} Dashboard data with all metrics
     */
    getDashboardData() {
        const stats = this.gameData ? this.gameData.getStats() : {
            lessonsCompleted: [],
            gamesPlayed: 0,
            gamesWon: 0
        };

        return {
            overview: this._getOverviewStats(stats),
            learningTime: this._getLearningTimeStats(),
            accuracy: this._getAccuracyStats(),
            skillMastery: this._getSkillMasteryStats(),
            achievements: this._getAchievementStats(),
            recentActivity: this._getRecentActivity(),
            recommendations: this._getRecommendations(),
            charts: this._getChartData()
        };
    }

    /**
     * Get overview statistics
     *
     * @private
     * @param {Object} stats - Game stats
     * @returns {Object} Overview data
     */
    _getOverviewStats(stats) {
        const totalLessons = 13;
        const lessonsCompleted = stats.lessonsCompleted.length;
        const completionRate = (lessonsCompleted / totalLessons) * 100;

        return {
            lessonsCompleted,
            totalLessons,
            completionRate: Math.round(completionRate),
            totalTime: this.progressData.totalTime,
            totalTimeFormatted: this._formatTime(this.progressData.totalTime),
            currentStreak: this.progressData.streakDays,
            achievementsUnlocked: this.progressData.achievements.length,
            totalAchievements: ACHIEVEMENTS.length
        };
    }

    /**
     * Get learning time statistics
     *
     * @private
     * @returns {Object} Time stats
     */
    _getLearningTimeStats() {
        const totalTime = this.progressData.totalTime;
        const sessionCount = Object.keys(this.progressData.dailyActivity).length;
        const averageSession = sessionCount > 0 ? totalTime / sessionCount : 0;

        // Calculate time by day of week
        const byDayOfWeek = this._getTimeByDayOfWeek();

        return {
            total: totalTime,
            totalFormatted: this._formatTime(totalTime),
            sessionCount,
            averageSession: Math.round(averageSession / 1000), // in seconds
            averageSessionFormatted: this._formatTime(averageSession),
            byDayOfWeek
        };
    }

    /**
     * Get accuracy statistics
     *
     * @private
     * @returns {Object} Accuracy stats
     */
    _getAccuracyStats() {
        const byLesson = {};
        let totalAccuracy = 0;
        let lessonCount = 0;

        Object.keys(this.progressData.accuracyByLesson).forEach(lessonId => {
            const attempts = this.progressData.accuracyByLesson[lessonId];
            const avgAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length;
            const bestAccuracy = Math.max(...attempts.map(a => a.accuracy));
            const latestAccuracy = attempts[attempts.length - 1].accuracy;

            byLesson[lessonId] = {
                attempts: attempts.length,
                average: Math.round(avgAccuracy),
                best: Math.round(bestAccuracy),
                latest: Math.round(latestAccuracy),
                trend: this._calculateTrend(attempts.map(a => a.accuracy))
            };

            totalAccuracy += avgAccuracy;
            lessonCount++;
        });

        const overallAccuracy = lessonCount > 0 ? totalAccuracy / lessonCount : 0;

        return {
            overall: Math.round(overallAccuracy),
            byLesson,
            lessonsWithPerfectScore: Object.values(byLesson).filter(l => l.best === 100).length
        };
    }

    /**
     * Get skill mastery statistics
     *
     * @private
     * @returns {Object} Skill mastery data
     */
    _getSkillMasteryStats() {
        const skills = {};

        Object.keys(SKILL_CATEGORIES).forEach(key => {
            const skill = SKILL_CATEGORIES[key];
            const mastery = this.progressData.skillMastery[skill.id];
            const level = this._getMasteryLevel(mastery.level);

            skills[skill.id] = {
                name: skill.name,
                description: skill.description,
                icon: skill.icon,
                level: mastery.level,
                levelName: level.name,
                color: level.color,
                attempts: mastery.attempts,
                successRate: mastery.attempts > 0
                    ? Math.round((mastery.successes / mastery.attempts) * 100)
                    : 0,
                lessons: skill.lessons
            };
        });

        return skills;
    }

    /**
     * Get achievement statistics
     *
     * @private
     * @returns {Object} Achievement data
     */
    _getAchievementStats() {
        const unlocked = this.progressData.achievements;
        const locked = ACHIEVEMENTS.filter(a => !unlocked.includes(a.id));

        return {
            unlocked: unlocked.map(id => ACHIEVEMENTS.find(a => a.id === id)),
            locked: locked.map(a => ({
                ...a,
                progress: this._getAchievementProgress(a)
            })),
            total: ACHIEVEMENTS.length,
            percentage: Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)
        };
    }

    /**
     * Get recent activity
     *
     * @private
     * @returns {Array<Object>} Recent activity entries
     */
    _getRecentActivity() {
        const activities = [];

        // Recent lessons
        if (this.gameData) {
            const stats = this.gameData.getStats();
            stats.lessonsCompleted.slice(-5).forEach(lessonId => {
                activities.push({
                    type: 'lesson',
                    description: `Completed Lesson ${lessonId}`,
                    icon: '📖',
                    timestamp: Date.now() // Approximation
                });
            });
        }

        // Recent achievements
        this.progressData.achievements.slice(-3).forEach(achievementId => {
            const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
            if (achievement) {
                activities.push({
                    type: 'achievement',
                    description: `Unlocked: ${achievement.name}`,
                    icon: achievement.icon,
                    timestamp: Date.now() // Approximation
                });
            }
        });

        return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    }

    /**
     * Get personalized recommendations
     *
     * @private
     * @returns {Array<Object>} Recommendations
     */
    _getRecommendations() {
        const recommendations = [];
        const stats = this.gameData ? this.gameData.getStats() : { lessonsCompleted: [] };

        // Recommendation: Next lesson
        if (stats.lessonsCompleted.length < 13) {
            recommendations.push({
                type: 'lesson',
                priority: 'high',
                title: `Continue to Lesson ${stats.lessonsCompleted.length + 1}`,
                description: 'Keep building your skills with the next lesson',
                action: 'start_lesson',
                data: { lessonId: stats.lessonsCompleted.length + 1 }
            });
        }

        // Recommendation: Practice weak skills
        const weakSkills = this._getWeakSkills();
        if (weakSkills.length > 0) {
            const skill = weakSkills[0];
            recommendations.push({
                type: 'practice',
                priority: 'medium',
                title: `Practice ${skill.name}`,
                description: `Your ${skill.name} skill is at ${skill.level}%. Try some practice exercises.`,
                action: 'practice_skill',
                data: { skillId: skill.id }
            });
        }

        // Recommendation: Review lessons with low accuracy
        const lowAccuracyLessons = this._getLowAccuracyLessons();
        if (lowAccuracyLessons.length > 0) {
            const lesson = lowAccuracyLessons[0];
            recommendations.push({
                type: 'review',
                priority: 'medium',
                title: `Review Lesson ${lesson.lessonId}`,
                description: `Your accuracy is ${lesson.accuracy}% on this lesson. A review might help.`,
                action: 'review_lesson',
                data: { lessonId: lesson.lessonId }
            });
        }

        // Recommendation: Take a break
        if (this.progressData.totalTime > 0) {
            const avgSessionTime = this._getAverageSessionTime();
            if (avgSessionTime > 3600000) { // > 1 hour
                recommendations.push({
                    type: 'wellness',
                    priority: 'low',
                    title: 'Take a Break',
                    description: 'Your sessions are quite long. Remember to take breaks!',
                    action: 'take_break'
                });
            }
        }

        return recommendations;
    }

    /**
     * Get chart data for visualizations
     *
     * @private
     * @returns {Object} Chart data
     */
    _getChartData() {
        return {
            accuracyOverTime: this._getAccuracyOverTimeChart(),
            skillRadar: this._getSkillRadarChart(),
            activityHeatmap: this._getActivityHeatmapData(),
            progressTimeline: this._getProgressTimelineData()
        };
    }

    /**
     * Get accuracy over time chart data
     *
     * @private
     * @returns {Object} Chart data
     */
    _getAccuracyOverTimeChart() {
        const data = [];

        Object.keys(this.progressData.accuracyByLesson).forEach(lessonId => {
            this.progressData.accuracyByLesson[lessonId].forEach(attempt => {
                data.push({
                    lesson: parseInt(lessonId),
                    accuracy: attempt.accuracy,
                    timestamp: attempt.timestamp
                });
            });
        });

        return data.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Get skill radar chart data
     *
     * @private
     * @returns {Array<Object>} Radar chart data
     */
    _getSkillRadarChart() {
        return Object.keys(SKILL_CATEGORIES).map(key => {
            const skill = SKILL_CATEGORIES[key];
            const mastery = this.progressData.skillMastery[skill.id];

            return {
                skill: skill.name,
                level: mastery.level
            };
        });
    }

    /**
     * Get activity heatmap data
     *
     * @private
     * @returns {Array<Object>} Heatmap data
     */
    _getActivityHeatmapData() {
        return Object.entries(this.progressData.dailyActivity).map(([date, data]) => ({
            date,
            value: data.sessions,
            time: data.time
        }));
    }

    /**
     * Get progress timeline data
     *
     * @private
     * @returns {Array<Object>} Timeline data
     */
    _getProgressTimelineData() {
        const timeline = [];

        // Add lesson completions
        if (this.gameData) {
            const stats = this.gameData.getStats();
            stats.lessonsCompleted.forEach(lessonId => {
                timeline.push({
                    type: 'lesson',
                    lesson: lessonId,
                    timestamp: Date.now() // Approximation
                });
            });
        }

        return timeline.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Update skill mastery
     *
     * @private
     * @param {string} lessonId - Lesson identifier
     * @param {number} accuracy - Accuracy percentage
     */
    _updateSkillMastery(lessonId, accuracy) {
        // Find which skill category this lesson belongs to
        Object.keys(SKILL_CATEGORIES).forEach(key => {
            const skill = SKILL_CATEGORIES[key];

            if (skill.lessons.includes(parseInt(lessonId))) {
                const mastery = this.progressData.skillMastery[skill.id];

                mastery.attempts++;
                if (accuracy >= 70) {
                    mastery.successes++;
                }

                // Calculate new level (weighted average)
                const successRate = (mastery.successes / mastery.attempts) * 100;
                mastery.level = Math.min(100, Math.round(successRate));
            }
        });
    }

    /**
     * Check and unlock achievements
     *
     * @private
     */
    _checkAchievements() {
        ACHIEVEMENTS.forEach(achievement => {
            if (!this.progressData.achievements.includes(achievement.id)) {
                if (this._checkAchievementRequirement(achievement)) {
                    this.progressData.achievements.push(achievement.id);
                }
            }
        });
    }

    /**
     * Check if achievement requirement is met
     *
     * @private
     * @param {Object} achievement - Achievement object
     * @returns {boolean} True if requirement is met
     */
    _checkAchievementRequirement(achievement) {
        const req = achievement.requirement;
        const stats = this.gameData ? this.gameData.getStats() : { lessonsCompleted: [] };

        switch (req.type) {
            case 'lessons_completed':
                return stats.lessonsCompleted.length >= req.value;

            case 'total_time':
                return this.progressData.totalTime >= req.value;

            case 'perfect_accuracy':
                return this._countPerfectScores() >= req.value;

            case 'scenarios_completed':
                // Would need scenario data - stub for now
                return false;

            case 'flawless_exercises':
                return this._countFlawlessExercises() >= req.value;

            case 'improvement_rate':
                // Would need mistake analyzer data - stub for now
                return false;

            case 'expert_exercises':
                return this._countExpertExercises() >= req.value;

            default:
                return false;
        }
    }

    /**
     * Get achievement progress
     *
     * @private
     * @param {Object} achievement - Achievement object
     * @returns {number} Progress percentage (0-100)
     */
    _getAchievementProgress(achievement) {
        const req = achievement.requirement;
        const stats = this.gameData ? this.gameData.getStats() : { lessonsCompleted: [] };
        let current = 0;

        switch (req.type) {
            case 'lessons_completed':
                current = stats.lessonsCompleted.length;
                break;

            case 'total_time':
                current = this.progressData.totalTime;
                break;

            case 'perfect_accuracy':
                current = this._countPerfectScores();
                break;

            default:
                return 0;
        }

        return Math.min(100, Math.round((current / req.value) * 100));
    }

    /**
     * Update daily activity
     *
     * @private
     */
    _updateDailyActivity() {
        const today = new Date().toISOString().split('T')[0];

        if (!this.progressData.dailyActivity[today]) {
            this.progressData.dailyActivity[today] = {
                sessions: 0,
                time: 0
            };
        }

        this.progressData.dailyActivity[today].sessions++;
    }

    /**
     * Update streak
     *
     * @private
     */
    _updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = this.progressData.lastActiveDate;

        if (!lastActive) {
            this.progressData.streakDays = 1;
        } else {
            const lastDate = new Date(lastActive);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                this.progressData.streakDays++;
            } else if (diffDays > 1) {
                // Streak broken
                this.progressData.streakDays = 1;
            }
            // Same day - no change
        }

        this.progressData.lastActiveDate = today;
    }

    /**
     * Get mastery level for percentage
     *
     * @private
     * @param {number} percentage - Mastery percentage
     * @returns {Object} Mastery level object
     */
    _getMasteryLevel(percentage) {
        const levels = Object.values(MASTERY_LEVELS).sort((a, b) => b.threshold - a.threshold);

        for (const level of levels) {
            if (percentage >= level.threshold) {
                return level;
            }
        }

        return MASTERY_LEVELS.NOVICE;
    }

    /**
     * Calculate trend for data series
     *
     * @private
     * @param {Array<number>} data - Data points
     * @returns {string} 'up', 'down', or 'stable'
     */
    _calculateTrend(data) {
        if (data.length < 2) return 'stable';

        const half = Math.floor(data.length / 2);
        const firstHalf = data.slice(0, half);
        const secondHalf = data.slice(half);

        const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

        const diff = secondAvg - firstAvg;

        if (diff > 5) return 'up';
        if (diff < -5) return 'down';
        return 'stable';
    }

    /**
     * Format time duration
     *
     * @private
     * @param {number} ms - Time in milliseconds
     * @returns {string} Formatted time string
     */
    _formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Get time spent by day of week
     *
     * @private
     * @returns {Object} Time by day
     */
    _getTimeByDayOfWeek() {
        const byDay = {
            0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
        };

        Object.keys(this.progressData.dailyActivity).forEach(dateStr => {
            const date = new Date(dateStr);
            const day = date.getDay();
            byDay[day] += this.progressData.dailyActivity[dateStr].time;
        });

        return byDay;
    }

    /**
     * Get weak skills
     *
     * @private
     * @returns {Array<Object>} Weak skills
     */
    _getWeakSkills() {
        return Object.keys(SKILL_CATEGORIES)
            .map(key => {
                const skill = SKILL_CATEGORIES[key];
                const mastery = this.progressData.skillMastery[skill.id];

                return {
                    id: skill.id,
                    name: skill.name,
                    level: mastery.level
                };
            })
            .filter(s => s.level < 70)
            .sort((a, b) => a.level - b.level);
    }

    /**
     * Get lessons with low accuracy
     *
     * @private
     * @returns {Array<Object>} Low accuracy lessons
     */
    _getLowAccuracyLessons() {
        return Object.keys(this.progressData.accuracyByLesson)
            .map(lessonId => {
                const attempts = this.progressData.accuracyByLesson[lessonId];
                const avgAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length;

                return {
                    lessonId,
                    accuracy: Math.round(avgAccuracy)
                };
            })
            .filter(l => l.accuracy < 70)
            .sort((a, b) => a.accuracy - b.accuracy);
    }

    /**
     * Get average session time
     *
     * @private
     * @returns {number} Average session time in ms
     */
    _getAverageSessionTime() {
        const sessions = Object.keys(this.progressData.dailyActivity).length;
        return sessions > 0 ? this.progressData.totalTime / sessions : 0;
    }

    /**
     * Count perfect scores
     *
     * @private
     * @returns {number} Number of perfect scores
     */
    _countPerfectScores() {
        let count = 0;

        Object.values(this.progressData.accuracyByLesson).forEach(attempts => {
            attempts.forEach(attempt => {
                if (attempt.accuracy === 100) {
                    count++;
                }
            });
        });

        return count;
    }

    /**
     * Count flawless exercises
     *
     * @private
     * @returns {number} Number of flawless exercises
     */
    _countFlawlessExercises() {
        let count = 0;

        Object.values(this.progressData.accuracyByLesson).forEach(attempts => {
            attempts.forEach(attempt => {
                if (attempt.mistakes === 0) {
                    count++;
                }
            });
        });

        return count;
    }

    /**
     * Count expert exercises
     *
     * @private
     * @returns {number} Number of expert exercises completed
     */
    _countExpertExercises() {
        let count = 0;

        Object.values(this.progressData.accuracyByLesson).forEach(attempts => {
            attempts.forEach(attempt => {
                if (attempt.difficulty === 'expert' && attempt.accuracy >= 70) {
                    count++;
                }
            });
        });

        return count;
    }

    /**
     * Clear all progress data
     */
    clearAllProgress() {
        this.progressData = {
            totalTime: 0,
            sessionStart: null,
            accuracyByLesson: {},
            practiceAttempts: [],
            achievements: [],
            skillMastery: {},
            dailyActivity: {},
            streakDays: 0,
            lastActiveDate: null
        };

        this._save();
    }

    /**
     * Export progress data
     *
     * @returns {Object} Complete progress data
     */
    exportData() {
        return {
            progressData: this.progressData,
            dashboard: this.getDashboardData()
        };
    }

    /**
     * Save progress data to storage
     *
     * @private
     */
    _save() {
        this.dataManager.set('progressData', this.progressData);
    }
}

/**
 * Export for use in other modules
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ProgressAnalyzer,
        SKILL_CATEGORIES,
        ACHIEVEMENTS,
        MASTERY_LEVELS
    };
}

// Browser global export
if (typeof window !== 'undefined') {
    window.ProgressAnalyzer = ProgressAnalyzer;
    window.SKILL_CATEGORIES = SKILL_CATEGORIES;
    window.ACHIEVEMENTS = ACHIEVEMENTS;
}
