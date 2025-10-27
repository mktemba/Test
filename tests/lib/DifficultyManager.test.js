/**
 * Unit tests for DifficultyManager
 */

const { DifficultyManager, DIFFICULTY_CONFIGS } = require('../../src/lib/DifficultyManager');

// Mock DataManager
class MockDataManager {
    constructor() {
        this.storage = {};
    }

    get(key, defaultValue) {
        return this.storage[key] !== undefined ? this.storage[key] : defaultValue;
    }

    set(key, value) {
        this.storage[key] = value;
        return true;
    }

    has(key) {
        return this.storage[key] !== undefined;
    }
}

describe('DifficultyManager', () => {
    let dataManager;
    let difficultyManager;

    beforeEach(() => {
        dataManager = new MockDataManager();
        difficultyManager = new DifficultyManager(dataManager);
    });

    describe('Initialization', () => {
        test('should initialize with default medium difficulty', () => {
            expect(difficultyManager.getCurrentDifficulty()).toBe('medium');
        });

        test('should throw error without DataManager', () => {
            expect(() => new DifficultyManager(null)).toThrow();
        });

        test('should load existing difficulty from storage', () => {
            dataManager.set('difficulty', 'hard');
            const manager = new DifficultyManager(dataManager);
            expect(manager.getCurrentDifficulty()).toBe('hard');
        });
    });

    describe('Difficulty Configuration', () => {
        test('should return correct config for current difficulty', () => {
            const config = difficultyManager.getCurrentConfig();
            expect(config.name).toBe('Medium');
            expect(config.tileCount).toBe(7);
        });

        test('should return all difficulty levels', () => {
            const difficulties = difficultyManager.getAllDifficulties();
            expect(difficulties.length).toBe(4);
            expect(difficulties[0].key).toBe('easy');
        });

        test('should get specific difficulty config', () => {
            const config = difficultyManager.getConfig('expert');
            expect(config.name).toBe('Expert');
            expect(config.tileCount).toBe(13);
        });
    });

    describe('Difficulty Setting', () => {
        test('should set difficulty successfully', () => {
            const result = difficultyManager.setDifficulty('hard');
            expect(result).toBe(true);
            expect(difficultyManager.getCurrentDifficulty()).toBe('hard');
        });

        test('should reject invalid difficulty', () => {
            const result = difficultyManager.setDifficulty('invalid');
            expect(result).toBe(false);
            expect(difficultyManager.getCurrentDifficulty()).toBe('medium');
        });

        test('should persist difficulty to storage', () => {
            difficultyManager.setDifficulty('expert');
            expect(dataManager.get('difficulty')).toBe('expert');
        });
    });

    describe('Performance Tracking', () => {
        test('should record attempt successfully', () => {
            const result = difficultyManager.recordAttempt('medium', true, 30.5);
            expect(result).toBeTruthy();
            expect(result.attemptCount).toBe(1);
            expect(result.successRate).toBe(1);
        });

        test('should calculate performance stats correctly', () => {
            difficultyManager.recordAttempt('medium', true, 30);
            difficultyManager.recordAttempt('medium', true, 35);
            difficultyManager.recordAttempt('medium', false, 45);

            const stats = difficultyManager.getPerformanceStats('medium');
            expect(stats.attemptCount).toBe(3);
            expect(stats.successRate).toBeCloseTo(0.667, 2);
            expect(stats.averageTime).toBeCloseTo(36.67, 1);
        });

        test('should track recent performance separately', () => {
            // Old attempts
            difficultyManager.recordAttempt('medium', false, 50, { accuracy: 0.5 });
            difficultyManager.recordAttempt('medium', false, 50, { accuracy: 0.5 });
            // Recent attempts
            difficultyManager.recordAttempt('medium', true, 30, { accuracy: 0.9 });
            difficultyManager.recordAttempt('medium', true, 30, { accuracy: 0.95 });
            difficultyManager.recordAttempt('medium', true, 30, { accuracy: 1.0 });

            const stats = difficultyManager.getPerformanceStats('medium');
            expect(stats.recentPerformance).toBeGreaterThan(0.8);
        });

        test('should limit stored attempts to 50', () => {
            for (let i = 0; i < 60; i++) {
                difficultyManager.recordAttempt('easy', true, 20);
            }

            const stats = difficultyManager.getPerformanceStats('easy');
            expect(stats.attemptCount).toBe(50);
        });
    });

    describe('Recommendations', () => {
        test('should recommend current difficulty with insufficient data', () => {
            difficultyManager.recordAttempt('medium', true, 30);
            const rec = difficultyManager.getRecommendation();
            expect(rec.suggested).toBe('medium');
            expect(rec.confidence).toBe('low');
        });

        test('should recommend higher difficulty with excellent performance', () => {
            for (let i = 0; i < 5; i++) {
                difficultyManager.recordAttempt('medium', true, 25, { accuracy: 0.95 });
            }

            const rec = difficultyManager.getRecommendation();
            expect(rec.suggested).toBe('hard');
            expect(rec.shouldChange).toBe(true);
        });

        test('should recommend lower difficulty with poor performance', () => {
            difficultyManager.setDifficulty('hard');
            for (let i = 0; i < 5; i++) {
                difficultyManager.recordAttempt('hard', false, 60, { accuracy: 0.4 });
            }

            const rec = difficultyManager.getRecommendation();
            expect(rec.suggested).toBe('medium');
            expect(rec.shouldChange).toBe(true);
        });

        test('should not recommend change beyond expert', () => {
            difficultyManager.setDifficulty('expert');
            for (let i = 0; i < 5; i++) {
                difficultyManager.recordAttempt('expert', true, 15, { accuracy: 1.0 });
            }

            const rec = difficultyManager.getRecommendation();
            expect(rec.suggested).toBe('expert');
        });

        test('should not recommend change below easy', () => {
            difficultyManager.setDifficulty('easy');
            for (let i = 0; i < 5; i++) {
                difficultyManager.recordAttempt('easy', false, 70, { accuracy: 0.3 });
            }

            const rec = difficultyManager.getRecommendation();
            expect(rec.suggested).toBe('easy');
        });
    });

    describe('Auto-Adjustment', () => {
        test('should auto-adjust difficulty when appropriate', () => {
            for (let i = 0; i < 5; i++) {
                difficultyManager.recordAttempt('medium', true, 25, { accuracy: 0.95 });
            }

            const result = difficultyManager.autoAdjustDifficulty();
            expect(result.changed).toBe(true);
            expect(result.to).toBe('hard');
        });

        test('should not auto-adjust with insufficient data', () => {
            difficultyManager.recordAttempt('medium', true, 30);
            const result = difficultyManager.autoAdjustDifficulty();
            expect(result.changed).toBe(false);
        });
    });

    describe('Exercise Configuration', () => {
        test('should return correct exercise config', () => {
            const config = difficultyManager.getExerciseConfig('tile_recognition');
            expect(config.tileCount).toBe(7);
            expect(config.timeLimit).toBe(45000);
            expect(config.difficulty).toBe('medium');
        });
    });

    describe('Score Calculation', () => {
        test('should calculate score with difficulty multiplier', () => {
            const score = difficultyManager.calculateScore(100);
            expect(score).toBe(150); // 100 * 1.5 (medium multiplier)
        });

        test('should apply no-hints bonus', () => {
            const score = difficultyManager.calculateScore(100, { hintsUsed: 0 });
            expect(score).toBe(180); // 100 * 1.5 * 1.2
        });

        test('should apply time bonus', () => {
            difficultyManager.setDifficulty('medium');
            const score = difficultyManager.calculateScore(100, { timeSpent: 20000 }); // Less than half of 45000
            expect(score).toBe(195); // 100 * 1.5 * 1.3
        });

        test('should apply perfect accuracy bonus', () => {
            const score = difficultyManager.calculateScore(100, { accuracy: 1.0 });
            expect(score).toBe(225); // 100 * 1.5 * 1.5
        });
    });

    describe('Performance Trend', () => {
        test('should detect improving trend', () => {
            // Early low performance
            for (let i = 0; i < 5; i++) {
                difficultyManager.recordAttempt('medium', false, 50, { accuracy: 0.5 });
            }
            // Later high performance
            for (let i = 0; i < 5; i++) {
                difficultyManager.recordAttempt('medium', true, 30, { accuracy: 0.9 });
            }

            const trend = difficultyManager.getPerformanceTrend('medium');
            expect(trend.trend).toBe('improving');
        });

        test('should detect declining trend', () => {
            // Early high performance
            for (let i = 0; i < 5; i++) {
                difficultyManager.recordAttempt('medium', true, 30, { accuracy: 0.9 });
            }
            // Later low performance
            for (let i = 0; i < 5; i++) {
                difficultyManager.recordAttempt('medium', false, 50, { accuracy: 0.5 });
            }

            const trend = difficultyManager.getPerformanceTrend('medium');
            expect(trend.trend).toBe('declining');
        });

        test('should detect stable trend', () => {
            for (let i = 0; i < 10; i++) {
                difficultyManager.recordAttempt('medium', true, 35, { accuracy: 0.75 });
            }

            const trend = difficultyManager.getPerformanceTrend('medium');
            expect(trend.trend).toBe('stable');
        });
    });

    describe('Data Management', () => {
        test('should export performance data', () => {
            difficultyManager.recordAttempt('medium', true, 30);
            const data = difficultyManager.exportData();

            expect(data.currentDifficulty).toBe('medium');
            expect(data.performanceHistory).toBeDefined();
            expect(data.stats).toBeDefined();
        });

        test('should reset performance history', () => {
            difficultyManager.recordAttempt('medium', true, 30);
            difficultyManager.resetPerformanceHistory();

            const stats = difficultyManager.getPerformanceStats('medium');
            expect(stats.attemptCount).toBe(0);
        });
    });
});

// Run tests if this file is executed directly
if (require.main === module) {
    console.log('Running DifficultyManager tests...');
    console.log('Note: Use a test runner like Jest for proper test execution');
}
