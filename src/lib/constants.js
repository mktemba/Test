/**
 * Application constants and configuration
 * Centralized configuration to avoid magic numbers
 */

const CONFIG = {
    // Auto-save configuration
    AUTOSAVE_INTERVAL_MS: 30000, // 30 seconds - balanced between data safety and performance
    // Rationale: Frequent enough to prevent data loss, but not so frequent as to cause
    // performance issues on low-end devices or trigger localStorage quota issues

    // AI timing configuration
    AI_MOVE_MIN_DELAY_MS: 800, // Minimum delay before AI move
    AI_MOVE_MAX_DELAY_MS: 1200, // Maximum delay before AI move
    // Rationale: Makes AI feel more natural and gives users time to process game state
    // Random delay between min/max prevents predictable timing patterns

    // Storage configuration
    STORAGE_PREFIX: 'mahjong_',
    MAX_STORAGE_RETRIES: 3,
    STORAGE_RETRY_DELAY_MS: 500,

    // Validation limits
    MAX_PLAYER_COUNT: 4,
    MIN_PLAYER_COUNT: 2,
    MAX_STRING_LENGTH: 10000, // For preference strings to prevent DoS

    // Performance thresholds
    MAX_AUTOSAVE_SIZE_BYTES: 100000, // 100KB - prevent large saves from blocking UI
    DEBOUNCE_DELAY_MS: 300,

    // Valid preference values (for enum validation)
    VALID_PREFERENCES: {
        theme: ['default', 'dark', 'light', 'high-contrast'],
        soundEnabled: [true, false],
        animationSpeed: ['slow', 'medium', 'fast', 'none'],
        showHints: [true, false],
        confirmActions: [true, false],
        aiDifficulty: ['easy', 'medium', 'hard', 'expert'],
        autoSort: [true, false],
        highlightWaiting: [true, false],
        showTileCount: [true, false],
        skipIntro: [true, false],
        showTips: [true, false],
        autoAdvance: [true, false],
        reducedMotion: [true, false],
        highContrast: [true, false],
        fontSize: ['small', 'medium', 'large', 'x-large']
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG };
}
