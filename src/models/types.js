/**
 * Type definitions and models for Mahjong game
 * Following TypeScript-style patterns in JavaScript
 */

/**
 * @typedef {Object} TileData
 * @property {'bamboo'|'character'|'dot'|'wind'|'dragon'} suit
 * @property {number} value - 1-9 for suits, 1-4 for winds, 1-3 for dragons
 * @property {number} id - Unique identifier
 */

/**
 * @typedef {Object} PlayerData
 * @property {string} name
 * @property {'East'|'South'|'West'|'North'} wind
 * @property {TileData[]} hand
 * @property {TileData[]} revealed
 * @property {TileData[]} discarded
 * @property {number} score
 * @property {boolean} isAI
 */

/**
 * @typedef {Object} GameStateData
 * @property {PlayerData[]} players
 * @property {number} currentPlayer
 * @property {TileData[]} wall
 * @property {TileData[]} discardPile
 * @property {'East'|'South'|'West'|'North'} wind
 * @property {number} roundNumber
 * @property {number} turnNumber
 * @property {'setup'|'playing'|'ended'} gamePhase
 * @property {number|null} winner
 * @property {HistoryEntry[]} history
 */

/**
 * @typedef {Object} HistoryEntry
 * @property {number} turn
 * @property {string} action
 * @property {Object} data
 * @property {number} timestamp
 */

/**
 * @typedef {Object} ClaimData
 * @property {'win'|'kong'|'pung'|'chow'} type
 * @property {number} playerIndex
 * @property {number} priority
 */

/**
 * @typedef {Object} LessonData
 * @property {number} id
 * @property {string} title
 * @property {string} type - 'tutorial' | 'practice' | 'advanced'
 * @property {boolean} completed
 */

// Validation utilities
const TileValidator = {
    /**
     * Validate tile data structure
     * @param {TileData} tile
     * @returns {boolean}
     */
    isValid(tile) {
        if (!tile || typeof tile !== 'object') return false;

        const validSuits = ['bamboo', 'character', 'dot', 'wind', 'dragon'];
        if (!validSuits.includes(tile.suit)) return false;

        if (typeof tile.value !== 'number') return false;

        if (tile.suit === 'wind' && (tile.value < 1 || tile.value > 4)) return false;
        if (tile.suit === 'dragon' && (tile.value < 1 || tile.value > 3)) return false;
        if (['bamboo', 'character', 'dot'].includes(tile.suit) &&
            (tile.value < 1 || tile.value > 9)) return false;

        return typeof tile.id === 'number';
    },

    /**
     * Validate array of tiles
     * @param {TileData[]} tiles
     * @returns {boolean}
     */
    isValidArray(tiles) {
        return Array.isArray(tiles) && tiles.every(t => this.isValid(t));
    }
};

const GameStateValidator = {
    /**
     * Validate game state structure
     * @param {GameStateData} state
     * @returns {boolean}
     */
    isValid(state) {
        if (!state || typeof state !== 'object') return false;

        if (!Array.isArray(state.players) || state.players.length !== 4) return false;

        const validPhases = ['setup', 'playing', 'ended'];
        if (!validPhases.includes(state.gamePhase)) return false;

        if (!TileValidator.isValidArray(state.wall)) return false;
        if (!TileValidator.isValidArray(state.discardPile)) return false;

        return true;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TileValidator,
        GameStateValidator
    };
}
