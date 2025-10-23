/**
 * MahjongController - Central game state management
 * Similar to GobanController in online-go.com
 * Handles game logic, state transitions, and event coordination
 */

class MahjongController {
    constructor(config = {}) {
        this.config = Object.assign({
            playerCount: 4,
            enableAI: true,
            difficulty: 'medium',
            autoSave: true
        }, config);

        this.engine = null;
        this.ai = null;
        this.listeners = new Map();
        this.state = null;
        this.aiMoveTimeout = null;
        this.autoSaveInterval = null;

        this.initialize();
    }

    /**
     * Initialize controller and dependencies
     */
    initialize() {
        // Game engine will be injected
        this.emit('initialized', { config: this.config });
    }

    /**
     * Set the game engine instance
     * @param {Object} engine - MahjongEngine instance
     */
    setEngine(engine) {
        this.engine = engine;
        this.state = engine.state;

        // Forward engine events
        engine.on('gameInitialized', (data) => this.handleGameInitialized(data));
        engine.on('tileDrawn', (data) => this.handleTileDrawn(data));
        engine.on('tileDiscarded', (data) => this.handleTileDiscarded(data));
        engine.on('claimAvailable', (data) => this.handleClaimAvailable(data));
        engine.on('gameEnded', (data) => this.handleGameEnded(data));
        engine.on('turnChanged', (data) => this.handleTurnChanged(data));
    }

    /**
     * Set AI instance
     * @param {Object} ai - MahjongAI instance
     */
    setAI(ai) {
        this.ai = ai;
    }

    /**
     * Event subscription system
     * @param {string} event
     * @param {Function} callback
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    /**
     * Remove event listener
     * @param {string} event
     * @param {Function} callback
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to all listeners
     * @param {string} event
     * @param {Object} data
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * Start a new game
     * @param {string[]} playerNames
     */
    startGame(playerNames = ['You', 'AI 1', 'AI 2', 'AI 3']) {
        if (!this.engine) {
            throw new Error('Engine not initialized');
        }

        this.engine.initGame(4, playerNames);
        this.emit('gameStarted', { players: this.state.players });

        if (this.config.autoSave) {
            this.scheduleAutoSave();
        }

        // If first player is AI, make their move
        if (this.state.players[0].isAI) {
            this.makeAIMove(0);
        }
    }

    /**
     * Handle human player's turn
     * @param {number} tileIndex - Index of tile to discard
     */
    playerDiscard(tileIndex) {
        const currentPlayer = this.state.currentPlayer;

        if (this.state.players[currentPlayer].isAI) {
            throw new Error('Cannot control AI player');
        }

        try {
            this.engine.discardTile(currentPlayer, tileIndex);
            this.engine.nextTurn();

            // If next player is AI, make their move
            const nextPlayer = this.state.currentPlayer;
            if (this.state.players[nextPlayer].isAI) {
                this.makeAIMove(nextPlayer);
            }
        } catch (error) {
            this.emit('error', { message: error.message });
        }
    }

    /**
     * Execute AI move
     * @param {number} playerIndex
     */
    makeAIMove(playerIndex) {
        if (!this.ai) {
            console.warn('AI not initialized');
            return;
        }

        // Clear any existing timeout
        if (this.aiMoveTimeout) {
            clearTimeout(this.aiMoveTimeout);
        }

        // Delay AI move for better UX
        this.aiMoveTimeout = setTimeout(() => {
            if (this.state.gamePhase !== 'playing') {
                this.aiMoveTimeout = null;
                return;
            }

            this.ai.makeMove(this.engine, playerIndex);

            // Chain to next AI if needed
            const nextPlayer = this.state.currentPlayer;
            if (this.state.players[nextPlayer]?.isAI) {
                this.makeAIMove(nextPlayer);
            } else {
                this.aiMoveTimeout = null;
            }
        }, 800 + Math.random() * 400);
    }

    /**
     * Handle player claiming a discarded tile
     * @param {string} claimType - 'pung', 'chow', 'kong', 'win'
     * @param {number} playerIndex
     */
    claimTile(claimType, playerIndex) {
        this.emit('tileClaimed', { type: claimType, player: playerIndex });

        if (claimType === 'win') {
            this.engine.declareWin(playerIndex);
        }
    }

    // Event handlers
    handleGameInitialized(data) {
        this.state = data;
        this.emit('stateChanged', this.state);
    }

    handleTileDrawn(data) {
        this.emit('tileDrawn', data);
        this.emit('stateChanged', this.state);
    }

    handleTileDiscarded(data) {
        this.emit('tileDiscarded', data);
        this.emit('stateChanged', this.state);
    }

    handleClaimAvailable(data) {
        // Check if human player can claim
        const humanClaims = data.claims.filter(c => !this.state.players[c.playerIndex].isAI);

        if (humanClaims.length > 0) {
            this.emit('claimPrompt', {
                tile: data.tile,
                claims: humanClaims
            });
        } else {
            // AI decision
            this.handleAIClaim(data);
        }
    }

    handleAIClaim(data) {
        const aiClaims = data.claims.filter(c => this.state.players[c.playerIndex].isAI);

        if (aiClaims.length === 0) return;

        // Sort by priority, AI decides whether to claim
        aiClaims.sort((a, b) => b.priority - a.priority);

        for (const claim of aiClaims) {
            const player = this.state.players[claim.playerIndex];
            const shouldClaim = this.ai.shouldClaim(player.hand, data.tile, claim.type);

            if (shouldClaim) {
                this.claimTile(claim.type, claim.playerIndex);
                break;
            }
        }
    }

    handleGameEnded(data) {
        this.emit('gameEnded', data);

        if (this.config.autoSave) {
            this.saveGame();
        }
    }

    handleTurnChanged(data) {
        this.emit('turnChanged', data);
    }

    // Persistence
    scheduleAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            if (this.state.gamePhase === 'playing') {
                this.engine.saveGame();
            }
        }, 30000); // Save every 30 seconds
    }

    saveGame() {
        if (this.engine) {
            this.engine.saveGame();
            this.emit('gameSaved', {});
        }
    }

    loadGame() {
        if (this.engine && this.engine.loadGame()) {
            this.state = this.engine.state;
            this.emit('gameLoaded', this.state);
            return true;
        }
        return false;
    }

    /**
     * Get current game state (immutable copy)
     * @returns {Object}
     */
    getState() {
        return this.state ? this.state.clone() : null;
    }

    /**
     * Get player by index
     * @param {number} index
     * @returns {Object}
     */
    getPlayer(index) {
        return this.state?.players[index] || null;
    }

    /**
     * Get current player
     * @returns {Object}
     */
    getCurrentPlayer() {
        return this.getPlayer(this.state?.currentPlayer);
    }

    /**
     * Check if it's human player's turn
     * @returns {boolean}
     */
    isHumanTurn() {
        const current = this.getCurrentPlayer();
        return current && !current.isAI;
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }

        if (this.aiMoveTimeout) {
            clearTimeout(this.aiMoveTimeout);
            this.aiMoveTimeout = null;
        }

        this.listeners.clear();
        this.engine = null;
        this.ai = null;
        this.state = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MahjongController };
}
