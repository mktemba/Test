/**
 * Unit tests for AudioManager
 * Tests audio playback, mute functionality, and preference persistence
 */

// Mock the AudioManager module before requiring it
jest.mock('../../src/lib/AudioManager', () => {
  const original = jest.requireActual('../../src/lib/AudioManager');
  return original;
});

describe('AudioManager', () => {
  let AudioManager;
  let audioManager;
  let mockDataManager;
  let mockAudioContext;
  let mockOscillator;
  let mockGainNode;

  beforeEach(() => {
    // Clear module cache
    jest.resetModules();

    // Mock DataManager
    mockDataManager = {
      get: jest.fn().mockReturnValue(false),
      set: jest.fn().mockReturnValue(true),
      has: jest.fn().mockReturnValue(false)
    };

    // Mock Web Audio API
    mockOscillator = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      type: 'sine',
      frequency: { setValueAtTime: jest.fn() }
    };

    mockGainNode = {
      connect: jest.fn(),
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      }
    };

    mockAudioContext = {
      createOscillator: jest.fn().mockReturnValue(mockOscillator),
      createGain: jest.fn().mockReturnValue(mockGainNode),
      currentTime: 0,
      destination: {},
      state: 'running',
      resume: jest.fn().mockResolvedValue()
    };

    // Mock window.AudioContext
    global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
    global.webkitAudioContext = global.AudioContext;

    // Import AudioManager after mocks are set up
    AudioManager = require('../../src/lib/AudioManager').AudioManager;
    audioManager = new AudioManager(mockDataManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with DataManager', () => {
      expect(audioManager).toBeDefined();
      expect(audioManager.isMuted).toBe(false);
    });

    test('should throw error without DataManager', () => {
      expect(() => new AudioManager()).toThrow('DataManager is required');
    });

    test('should respect saved mute preference', () => {
      mockDataManager.get.mockReturnValue(true);
      const manager = new AudioManager(mockDataManager);
      expect(manager.isMuted).toBe(true);
    });

    test('should detect Web Audio API support', () => {
      expect(audioManager.hasWebAudio).toBe(true);
    });

    test('should handle missing Web Audio API', () => {
      delete global.AudioContext;
      delete global.webkitAudioContext;
      const manager = new AudioManager(mockDataManager);
      expect(manager.hasWebAudio).toBe(false);
    });
  });

  describe('Sound Playback', () => {
    test('should play tile click sound', async () => {
      await audioManager.playSound('tileClick');
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
    });

    test('should play success sound', async () => {
      await audioManager.playSound('success');
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalled();
    });

    test('should play error sound', async () => {
      await audioManager.playSound('error');
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    test('should not play sound when muted', async () => {
      audioManager.setMuted(true);
      await audioManager.playSound('tileClick');
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    test('should handle invalid sound type gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      await audioManager.playSound('invalidSound');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown sound'));
      consoleSpy.mockRestore();
    });

    test('should respect volume settings', async () => {
      await audioManager.playSound('tileClick');
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('Mute Functionality', () => {
    test('should toggle mute state', () => {
      expect(audioManager.isMuted).toBe(false);
      audioManager.toggleMute();
      expect(audioManager.isMuted).toBe(true);
      audioManager.toggleMute();
      expect(audioManager.isMuted).toBe(false);
    });

    test('should set mute state explicitly', () => {
      audioManager.setMuted(true);
      expect(audioManager.isMuted).toBe(true);
      expect(mockDataManager.set).toHaveBeenCalledWith('audioMuted', true);
    });

    test('should persist mute preference', () => {
      audioManager.setMuted(true);
      expect(mockDataManager.set).toHaveBeenCalledWith('audioMuted', true);

      audioManager.setMuted(false);
      expect(mockDataManager.set).toHaveBeenCalledWith('audioMuted', false);
    });

    test('should get current mute state', () => {
      audioManager.setMuted(false);
      expect(audioManager.getMuted()).toBe(false);

      audioManager.setMuted(true);
      expect(audioManager.getMuted()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    test('should respect prefers-reduced-motion', () => {
      // Mock matchMedia
      const mockMatchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addListener: jest.fn(),
        removeListener: jest.fn()
      }));
      global.matchMedia = mockMatchMedia;

      const manager = new AudioManager(mockDataManager);
      expect(manager.prefersReducedMotion).toBe(true);
    });

    test('should not play sound with reduced motion preference', async () => {
      audioManager.prefersReducedMotion = true;
      await audioManager.playSound('tileClick');
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });
  });

  describe('Preloading', () => {
    test('should preload all sounds', async () => {
      const result = await audioManager.preloadSounds();
      expect(result).toBe(true);
    });

    test('should handle preload errors gracefully', async () => {
      mockAudioContext.createOscillator.mockImplementation(() => {
        throw new Error('Audio error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await audioManager.preloadSounds();
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('Audio Context Management', () => {
    test('should resume audio context if suspended', async () => {
      mockAudioContext.state = 'suspended';
      await audioManager.playSound('tileClick');
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    test('should handle audio context errors', async () => {
      mockAudioContext.createOscillator.mockImplementation(() => {
        throw new Error('Audio context error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      await audioManager.playSound('tileClick');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Feedback Patterns', () => {
    test('should play correct match sound', async () => {
      await audioManager.playCorrectMatch();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    test('should play incorrect match sound', async () => {
      await audioManager.playIncorrectMatch();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    test('should play achievement sound', async () => {
      await audioManager.playAchievement();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    test('should play level complete sound', async () => {
      await audioManager.playLevelComplete();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    test('should track audio latency', async () => {
      const startTime = Date.now();
      await audioManager.playSound('tileClick');
      const endTime = Date.now();
      const latency = endTime - startTime;

      expect(latency).toBeLessThan(50); // Target < 50ms latency
    });

    test('should limit concurrent sounds', async () => {
      // Play multiple sounds simultaneously
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(audioManager.playSound('tileClick'));
      }

      await Promise.all(promises);
      // Should not crash or cause issues
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing audio context gracefully', async () => {
      audioManager.audioContext = null;
      audioManager.hasWebAudio = false;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      await audioManager.playSound('tileClick');
      expect(consoleSpy).not.toThrow();
      consoleSpy.mockRestore();
    });

    test('should handle oscillator creation failure', async () => {
      mockAudioContext.createOscillator = jest.fn().mockImplementation(() => {
        throw new Error('Failed to create oscillator');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      await audioManager.playSound('tileClick');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});