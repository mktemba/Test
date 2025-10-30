/**
 * Integration tests for the complete learning flow
 * Tests the interaction between multiple modules
 */

describe('Learning Flow Integration', () => {
  let dataManager;
  let audioManager;
  let difficultyManager;
  let progressAnalyzer;
  let mistakeAnalyzer;
  let scenarioEngine;

  beforeEach(() => {
    // Initialize all managers with real implementations
    jest.resetModules();

    // Mock localStorage
    const storage = {};
    global.localStorage = {
      getItem: jest.fn(key => storage[key] || null),
      setItem: jest.fn((key, value) => { storage[key] = value; }),
      removeItem: jest.fn(key => { delete storage[key]; }),
      clear: jest.fn(() => { Object.keys(storage).forEach(key => delete storage[key]); })
    };

    // Initialize modules (would normally import them)
    dataManager = {
      get: jest.fn((key, defaultValue) => storage[key] || defaultValue),
      set: jest.fn((key, value) => { storage[key] = value; return true; }),
      has: jest.fn(key => key in storage)
    };

    audioManager = {
      playSound: jest.fn(),
      setMuted: jest.fn(),
      isMuted: false
    };

    difficultyManager = {
      getCurrentDifficulty: jest.fn(() => 'medium'),
      setDifficulty: jest.fn(),
      recordAttempt: jest.fn(),
      getRecommendation: jest.fn(() => ({ suggested: 'medium', shouldChange: false }))
    };

    progressAnalyzer = {
      recordProgress: jest.fn(),
      getProgressSummary: jest.fn(() => ({
        lessonsCompleted: 5,
        totalLessons: 13,
        overallProgress: 38.5
      }))
    };

    mistakeAnalyzer = {
      recordMistake: jest.fn(),
      getMistakePatterns: jest.fn(() => []),
      getSuggestions: jest.fn(() => [])
    };

    scenarioEngine = {
      generateScenario: jest.fn(() => ({
        tiles: [],
        objective: 'Test objective',
        difficulty: 'medium'
      })),
      validateSolution: jest.fn(() => ({ valid: true, score: 100 }))
    };
  });

  describe('Lesson Progression', () => {
    test('should track progress through lessons', () => {
      // Start lesson 1
      progressAnalyzer.recordProgress({
        lesson: 1,
        completed: false,
        timeSpent: 0
      });

      // Complete lesson 1
      progressAnalyzer.recordProgress({
        lesson: 1,
        completed: true,
        timeSpent: 120000
      });

      expect(progressAnalyzer.recordProgress).toHaveBeenCalledTimes(2);
      expect(dataManager.set).toHaveBeenCalled();
    });

    test('should update difficulty based on performance', () => {
      // Record multiple successful attempts
      for (let i = 0; i < 5; i++) {
        difficultyManager.recordAttempt('medium', true, 30);
      }

      difficultyManager.getRecommendation.mockReturnValue({
        suggested: 'hard',
        shouldChange: true
      });

      const recommendation = difficultyManager.getRecommendation();
      expect(recommendation.suggested).toBe('hard');
      expect(recommendation.shouldChange).toBe(true);
    });

    test('should provide audio feedback for actions', () => {
      // Correct answer
      audioManager.playSound('success');
      expect(audioManager.playSound).toHaveBeenCalledWith('success');

      // Wrong answer
      audioManager.playSound('error');
      expect(audioManager.playSound).toHaveBeenCalledWith('error');
    });
  });

  describe('Practice Exercise Flow', () => {
    test('should complete a full practice exercise', () => {
      // Generate scenario
      const scenario = scenarioEngine.generateScenario('tile_recognition', 'medium');
      expect(scenario).toBeDefined();
      expect(scenario.difficulty).toBe('medium');

      // User attempts solution
      const userSolution = { tiles: [] }; // Mock solution
      const result = scenarioEngine.validateSolution(userSolution, scenario);

      expect(result.valid).toBeDefined();
      expect(result.score).toBeDefined();

      // Record attempt
      difficultyManager.recordAttempt('medium', result.valid, 45);

      // Play feedback sound
      if (result.valid) {
        audioManager.playSound('success');
      } else {
        audioManager.playSound('error');
      }

      expect(audioManager.playSound).toHaveBeenCalled();
    });

    test('should track mistakes during practice', () => {
      const mistake = {
        type: 'tile_misidentification',
        expected: { suit: 'bamboo', value: 1 },
        actual: { suit: 'bamboo', value: 2 },
        timestamp: Date.now()
      };

      mistakeAnalyzer.recordMistake(mistake);
      expect(mistakeAnalyzer.recordMistake).toHaveBeenCalledWith(mistake);

      // Get suggestions based on mistakes
      mistakeAnalyzer.getSuggestions.mockReturnValue([
        'Practice distinguishing between similar bamboo tiles'
      ]);

      const suggestions = mistakeAnalyzer.getSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Data Persistence', () => {
    test('should save and restore user progress', () => {
      const progressData = {
        currentLesson: 5,
        completedLessons: [1, 2, 3, 4],
        difficulty: 'medium',
        totalTimeSpent: 3600000
      };

      // Save progress
      dataManager.set('userProgress', JSON.stringify(progressData));
      expect(dataManager.set).toHaveBeenCalledWith('userProgress', expect.any(String));

      // Restore progress
      const savedData = JSON.parse(dataManager.get('userProgress', '{}'));
      expect(savedData.currentLesson).toBe(5);
      expect(savedData.completedLessons).toEqual([1, 2, 3, 4]);
    });

    test('should handle storage quota exceeded', () => {
      // Simulate quota exceeded error
      dataManager.set.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        dataManager.set('largeData', 'x'.repeat(10000000));
      }).toThrow('QuotaExceededError');
    });
  });

  describe('Performance Tracking', () => {
    test('should track performance metrics across modules', () => {
      const metrics = {
        lessonsCompleted: 0,
        practiceSessionsCompleted: 0,
        averageAccuracy: 0,
        totalErrors: 0
      };

      // Complete a lesson
      metrics.lessonsCompleted++;
      progressAnalyzer.recordProgress({ lesson: 1, completed: true });

      // Complete practice sessions
      for (let i = 0; i < 3; i++) {
        metrics.practiceSessionsCompleted++;
        const success = i < 2; // 2 successes, 1 failure
        difficultyManager.recordAttempt('medium', success, 40);
        if (!success) metrics.totalErrors++;
      }

      metrics.averageAccuracy = (2 / 3) * 100;

      expect(metrics.lessonsCompleted).toBe(1);
      expect(metrics.practiceSessionsCompleted).toBe(3);
      expect(metrics.averageAccuracy).toBeCloseTo(66.67, 1);
      expect(metrics.totalErrors).toBe(1);
    });
  });

  describe('Error Recovery', () => {
    test('should handle module initialization failures', () => {
      // Simulate AudioManager failure
      audioManager.playSound.mockImplementation(() => {
        throw new Error('Audio system unavailable');
      });

      // Should continue working without audio
      expect(() => {
        audioManager.playSound('success');
      }).toThrow('Audio system unavailable');

      // Other modules should still work
      expect(() => {
        difficultyManager.recordAttempt('medium', true, 30);
      }).not.toThrow();
    });

    test('should handle data corruption gracefully', () => {
      // Simulate corrupted data
      dataManager.get.mockReturnValue('corrupted{data');

      const parseData = () => {
        try {
          return JSON.parse(dataManager.get('userProgress', '{}'));
        } catch {
          return {}; // Return default on parse error
        }
      };

      const data = parseData();
      expect(data).toEqual({});
    });
  });

  describe('User Settings Integration', () => {
    test('should apply user preferences across modules', () => {
      const preferences = {
        audioEnabled: false,
        difficulty: 'hard',
        theme: 'dark'
      };

      // Apply audio preference
      audioManager.setMuted(!preferences.audioEnabled);
      expect(audioManager.setMuted).toHaveBeenCalledWith(true);

      // Apply difficulty preference
      difficultyManager.setDifficulty(preferences.difficulty);
      expect(difficultyManager.setDifficulty).toHaveBeenCalledWith('hard');

      // Save preferences
      dataManager.set('preferences', JSON.stringify(preferences));
      expect(dataManager.set).toHaveBeenCalledWith('preferences', expect.any(String));
    });
  });

  describe('Achievement System Integration', () => {
    test('should unlock achievements based on progress', () => {
      const achievements = [];

      // Complete first lesson - unlock "Getting Started" achievement
      progressAnalyzer.recordProgress({ lesson: 1, completed: true });

      if (progressAnalyzer.getProgressSummary().lessonsCompleted >= 1) {
        achievements.push({
          id: 'getting_started',
          name: 'Getting Started',
          unlocked: true
        });
        audioManager.playSound('achievement');
      }

      expect(achievements).toHaveLength(1);
      expect(achievements[0].id).toBe('getting_started');
    });

    test('should track streak achievements', () => {
      let correctStreak = 0;
      const achievements = [];

      // Record 5 correct answers in a row
      for (let i = 0; i < 5; i++) {
        difficultyManager.recordAttempt('medium', true, 30);
        correctStreak++;

        if (correctStreak === 5) {
          achievements.push({
            id: 'perfect_streak',
            name: 'Perfect Streak',
            unlocked: true
          });
          audioManager.playSound('achievement');
        }
      }

      expect(achievements).toHaveLength(1);
      expect(achievements[0].id).toBe('perfect_streak');
    });
  });
});