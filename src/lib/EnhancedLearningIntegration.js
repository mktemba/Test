/**
 * EnhancedLearningIntegration.js
 * Integration module that ties together all learning enhancement features
 *
 * This module provides a unified interface for:
 * - DifficultyManager
 * - AudioManager
 * - MistakeAnalyzer
 * - ScenarioEngine
 * - ProgressAnalyzer
 *
 * @module EnhancedLearningIntegration
 * @version 1.0.0
 */

/**
 * EnhancedLearningSystem Class
 * Unified interface for all learning enhancement features
 *
 * @class
 * @example
 * const learningSystem = new EnhancedLearningSystem(dataManager, gameData, preferences);
 * learningSystem.initialize();
 * learningSystem.startPracticeSession('lesson_5');
 */
class EnhancedLearningSystem {
    /**
     * Create a new EnhancedLearningSystem
     *
     * @param {Object} dataManager - DataManager instance
     * @param {Object} gameData - GameData instance
     * @param {Object} preferences - PreferencesManager instance
     */
    constructor(dataManager, gameData, preferences) {
        if (!dataManager || !gameData || !preferences) {
            throw new Error('EnhancedLearningSystem requires dataManager, gameData, and preferences');
        }

        this.dataManager = dataManager;
        this.gameData = gameData;
        this.preferences = preferences;

        // Initialize subsystems
        this.difficultyManager = null;
        this.audioManager = null;
        this.mistakeAnalyzer = null;
        this.scenarioEngine = null;
        this.progressAnalyzer = null;

        this.initialized = false;
    }

    /**
     * Initialize all learning systems
     */
    initialize() {
        if (this.initialized) return;

        console.log('Initializing Enhanced Learning System...');

        try {
            // Initialize difficulty manager
            this.difficultyManager = new DifficultyManager(this.dataManager);
            console.log('✓ DifficultyManager initialized');

            // Initialize audio manager
            this.audioManager = new AudioManager(this.preferences);
            console.log('✓ AudioManager initialized');

            // Initialize mistake analyzer
            this.mistakeAnalyzer = new MistakeAnalyzer(this.dataManager);
            console.log('✓ MistakeAnalyzer initialized');

            // Initialize scenario engine
            this.scenarioEngine = new ScenarioEngine(this.dataManager, this.gameData);
            console.log('✓ ScenarioEngine initialized');

            // Initialize progress analyzer
            this.progressAnalyzer = new ProgressAnalyzer(this.dataManager, this.gameData);
            console.log('✓ ProgressAnalyzer initialized');

            this.initialized = true;
            console.log('Enhanced Learning System ready!');

            // Start tracking session
            this.progressAnalyzer.trackSessionStart();

        } catch (error) {
            console.error('Error initializing Enhanced Learning System:', error);
            throw error;
        }
    }

    /**
     * Start a practice session
     *
     * @param {string} lessonId - Lesson identifier
     * @param {Object} options - Session options
     * @returns {Object} Session configuration
     */
    startPracticeSession(lessonId, options = {}) {
        this._ensureInitialized();

        const difficulty = options.difficulty || this.difficultyManager.getCurrentDifficulty();
        const config = this.difficultyManager.getExerciseConfig('practice');

        // Play start sound
        this.audioManager.play('tileClick');

        return {
            lessonId,
            difficulty,
            config,
            sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }

    /**
     * Submit a practice answer
     *
     * @param {Object} submission - Answer submission
     * @returns {Object} Result with feedback
     */
    submitAnswer(submission) {
        this._ensureInitialized();

        const { lessonId, questionId, answer, correctAnswer, timeSpent } = submission;
        const isCorrect = answer === correctAnswer;

        // Record performance
        const difficulty = this.difficultyManager.getCurrentDifficulty();
        this.difficultyManager.recordAttempt(
            difficulty,
            isCorrect,
            timeSpent / 1000,
            {
                lessonId,
                accuracy: isCorrect ? 1.0 : 0.0,
                mistakes: isCorrect ? 0 : 1
            }
        );

        // Play audio feedback
        if (isCorrect) {
            this.audioManager.play('success');
        } else {
            this.audioManager.play('error');

            // Record mistake
            this.mistakeAnalyzer.recordMistake(
                window.MISTAKE_TYPES.CONFUSED_TILES,
                {
                    lessonId,
                    exerciseId: questionId,
                    expectedTile: correctAnswer,
                    selectedTile: answer,
                    description: `Incorrect answer in lesson ${lessonId}`
                }
            );
        }

        return {
            correct: isCorrect,
            correctAnswer,
            feedback: this._generateFeedback(isCorrect, submission),
            recommendation: this.difficultyManager.getRecommendation()
        };
    }

    /**
     * Complete a lesson
     *
     * @param {string} lessonId - Lesson identifier
     * @param {Object} results - Lesson results
     */
    completeLesson(lessonId, results) {
        this._ensureInitialized();

        const { accuracy, timeSpent, mistakes } = results;

        // Mark lesson as complete
        this.gameData.completeLesson(parseInt(lessonId));

        // Track accuracy
        this.progressAnalyzer.trackLessonAccuracy(lessonId, accuracy * 100, {
            timeSpent,
            mistakes,
            difficulty: this.difficultyManager.getCurrentDifficulty()
        });

        // Play completion sound
        if (accuracy >= 0.9) {
            this.audioManager.play('achievement');
        } else if (accuracy >= 0.7) {
            this.audioManager.play('success');
        } else {
            this.audioManager.play('tileMatch');
        }

        // Check for difficulty adjustment
        const adjustment = this.difficultyManager.autoAdjustDifficulty();
        if (adjustment.changed) {
            console.log(`Difficulty auto-adjusted to ${adjustment.to}`);
        }

        return {
            lessonId,
            accuracy,
            difficultyAdjustment: adjustment,
            recommendations: this.mistakeAnalyzer.getRecommendations()
        };
    }

    /**
     * Start a scenario challenge
     *
     * @returns {Object} Scenario object
     */
    startScenario() {
        this._ensureInitialized();

        const scenario = this.scenarioEngine.getNextScenario();

        if (scenario) {
            this.audioManager.play('hint');
        }

        return scenario;
    }

    /**
     * Submit scenario answer
     *
     * @param {string} scenarioId - Scenario identifier
     * @param {string} choiceId - Selected choice
     * @returns {Object} Result with explanation
     */
    submitScenarioAnswer(scenarioId, choiceId) {
        this._ensureInitialized();

        const result = this.scenarioEngine.submitAnswer(scenarioId, choiceId);

        if (result.success) {
            if (result.isOptimal) {
                this.audioManager.play('achievement');
            } else if (result.score >= 70) {
                this.audioManager.play('success');
            } else {
                this.audioManager.play('error');
            }
        }

        return result;
    }

    /**
     * Get comprehensive dashboard data
     *
     * @returns {Object} Dashboard data from all systems
     */
    getDashboard() {
        this._ensureInitialized();

        return {
            progress: this.progressAnalyzer.getDashboardData(),
            difficulty: {
                current: this.difficultyManager.getCurrentDifficulty(),
                config: this.difficultyManager.getCurrentConfig(),
                performance: this.difficultyManager.exportData(),
                recommendation: this.difficultyManager.getRecommendation()
            },
            mistakes: this.mistakeAnalyzer.getCommonMistakesSummary(),
            scenarios: {
                stats: this.scenarioEngine.getStats(),
                next: this.scenarioEngine.getNextScenario(),
                byCategory: this.scenarioEngine.getScenariosByCategory()
            },
            audio: {
                enabled: this.audioManager.isEnabled(),
                stats: this.audioManager.getStats()
            }
        };
    }

    /**
     * Get personalized learning recommendations
     *
     * @returns {Array<Object>} Prioritized recommendations
     */
    getRecommendations() {
        this._ensureInitialized();

        const recommendations = [];

        // Difficulty recommendations
        const diffRec = this.difficultyManager.getRecommendation();
        if (diffRec.shouldChange) {
            recommendations.push({
                type: 'difficulty',
                priority: diffRec.confidence === 'high' ? 'high' : 'medium',
                title: 'Difficulty Adjustment',
                description: diffRec.reason,
                action: 'change_difficulty',
                data: { suggested: diffRec.suggested }
            });
        }

        // Mistake-based recommendations
        const mistakeRecs = this.mistakeAnalyzer.getRecommendations();
        recommendations.push(...mistakeRecs);

        // Progress-based recommendations
        const progressData = this.progressAnalyzer.getDashboardData();
        recommendations.push(...progressData.recommendations);

        // Sort by priority
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        recommendations.sort((a, b) =>
            priorityOrder[a.priority] - priorityOrder[b.priority]
        );

        return recommendations.slice(0, 5); // Return top 5
    }

    /**
     * End current learning session
     *
     * @returns {Object} Session summary
     */
    endSession() {
        this._ensureInitialized();

        const sessionDuration = this.progressAnalyzer.trackSessionEnd();
        const dashboard = this.getDashboard();

        return {
            duration: sessionDuration,
            formatted: this._formatTime(sessionDuration),
            summary: {
                lessonsCompleted: dashboard.progress.overview.lessonsCompleted,
                accuracy: dashboard.progress.accuracy.overall,
                achievementsUnlocked: dashboard.progress.overview.achievementsUnlocked
            }
        };
    }

    /**
     * Toggle audio
     *
     * @returns {boolean} New audio state
     */
    toggleAudio() {
        this._ensureInitialized();
        return this.audioManager.toggleMute();
    }

    /**
     * Change difficulty manually
     *
     * @param {string} difficulty - New difficulty level
     * @returns {Object} Change result
     */
    changeDifficulty(difficulty) {
        this._ensureInitialized();

        const success = this.difficultyManager.setDifficulty(difficulty);

        if (success) {
            this.audioManager.play('levelUp');
            return {
                success: true,
                difficulty,
                config: this.difficultyManager.getCurrentConfig()
            };
        }

        return {
            success: false,
            error: 'Invalid difficulty level'
        };
    }

    /**
     * Export all learning data
     *
     * @returns {Object} Complete learning data export
     */
    exportAllData() {
        this._ensureInitialized();

        return {
            timestamp: new Date().toISOString(),
            difficulty: this.difficultyManager.exportData(),
            mistakes: this.mistakeAnalyzer.exportData(),
            scenarios: this.scenarioEngine.exportData(),
            progress: this.progressAnalyzer.exportData(),
            preferences: this.preferences.getAll()
        };
    }

    /**
     * Reset all progress (with confirmation)
     *
     * @param {boolean} confirmed - Confirmation flag
     * @returns {Object} Reset result
     */
    resetAllProgress(confirmed = false) {
        if (!confirmed) {
            return {
                success: false,
                error: 'Reset requires confirmation'
            };
        }

        this._ensureInitialized();

        try {
            this.difficultyManager.resetPerformanceHistory();
            this.mistakeAnalyzer.clearAllMistakes();
            this.scenarioEngine.resetProgress();
            this.progressAnalyzer.clearAllProgress();
            this.audioManager.play('hint');

            return {
                success: true,
                message: 'All progress has been reset'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate feedback message
     *
     * @private
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {Object} submission - Answer submission
     * @returns {string} Feedback message
     */
    _generateFeedback(isCorrect, submission) {
        if (isCorrect) {
            const messages = [
                'Excellent work!',
                'Perfect!',
                'Well done!',
                'That\'s correct!',
                'Great job!'
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        } else {
            const messages = [
                'Not quite. Try again!',
                'Almost! Review the lesson material.',
                'Incorrect. Check your understanding.',
                'That\'s not right. Let\'s review.',
                'Try again. You can do it!'
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        }
    }

    /**
     * Format time duration
     *
     * @private
     * @param {number} ms - Time in milliseconds
     * @returns {string} Formatted time
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
     * Ensure system is initialized
     *
     * @private
     */
    _ensureInitialized() {
        if (!this.initialized) {
            throw new Error('Enhanced Learning System not initialized. Call initialize() first.');
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.audioManager) {
            this.audioManager.destroy();
        }

        this.initialized = false;
    }
}

/**
 * Create and initialize Enhanced Learning System
 *
 * @param {Object} dataManager - DataManager instance
 * @param {Object} gameData - GameData instance
 * @param {Object} preferences - PreferencesManager instance
 * @returns {EnhancedLearningSystem} Initialized system
 */
function createEnhancedLearningSystem(dataManager, gameData, preferences) {
    const system = new EnhancedLearningSystem(dataManager, gameData, preferences);
    system.initialize();
    return system;
}

/**
 * Export for use in other modules
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedLearningSystem,
        createEnhancedLearningSystem
    };
}

// Browser global export
if (typeof window !== 'undefined') {
    window.EnhancedLearningSystem = EnhancedLearningSystem;
    window.createEnhancedLearningSystem = createEnhancedLearningSystem;
}
