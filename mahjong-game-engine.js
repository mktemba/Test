/**
 * Mahjong Game Engine
 * Sophisticated architecture with proper state management, rules validation, and AI
 * Based on modern game development patterns
 */

// =============================================================================
// CORE GAME STATE MANAGEMENT
// =============================================================================

class MahjongGameState {
    constructor() {
        this.players = [];
        this.currentPlayer = 0;
        this.wall = [];
        this.discardPile = [];
        this.wind = 'East'; // Prevailing wind
        this.roundNumber = 1;
        this.turnNumber = 0;
        this.gamePhase = 'setup'; // setup, playing, ended
        this.winner = null;
        this.history = [];
    }

    clone() {
        const cloned = new MahjongGameState();
        cloned.players = this.players.map(p => ({ ...p, hand: [...p.hand] }));
        cloned.currentPlayer = this.currentPlayer;
        cloned.wall = [...this.wall];
        cloned.discardPile = [...this.discardPile];
        cloned.wind = this.wind;
        cloned.roundNumber = this.roundNumber;
        cloned.turnNumber = this.turnNumber;
        cloned.gamePhase = this.gamePhase;
        cloned.winner = this.winner;
        cloned.history = [...this.history];
        return cloned;
    }

    toJSON() {
        return {
            players: this.players,
            currentPlayer: this.currentPlayer,
            wall: this.wall,
            discardPile: this.discardPile,
            wind: this.wind,
            roundNumber: this.roundNumber,
            turnNumber: this.turnNumber,
            gamePhase: this.gamePhase,
            winner: this.winner,
            history: this.history
        };
    }

    static fromJSON(data) {
        const state = new MahjongGameState();
        Object.assign(state, data);
        return state;
    }
}

// =============================================================================
// TILE SYSTEM
// =============================================================================

class Tile {
    constructor(suit, value, id) {
        this.suit = suit; // 'bamboo', 'character', 'dot', 'wind', 'dragon'
        this.value = value; // 1-9 for suits, specific for honors
        this.id = id; // Unique identifier
    }

    equals(other) {
        return this.suit === other.suit && this.value === other.value;
    }

    isHonor() {
        return this.suit === 'wind' || this.suit === 'dragon';
    }

    isTerminal() {
        return !this.isHonor() && (this.value === 1 || this.value === 9);
    }

    isSimple() {
        return !this.isHonor() && this.value >= 2 && this.value <= 8;
    }

    toString() {
        if (this.suit === 'wind') {
            return ['East', 'South', 'West', 'North'][this.value - 1];
        }
        if (this.suit === 'dragon') {
            return ['Red', 'Green', 'White'][this.value - 1];
        }
        return `${this.value} ${this.suit}`;
    }

    toSymbol() {
        const symbols = {
            bamboo: ['🎋', '🎋🎋', '🎋🎋🎋', '🎋🎋🎋🎋', '🎋🎋🎋🎋🎋', '🎋🎋🎋🎋🎋🎋', '🎋🎋🎋🎋🎋🎋🎋', '🎋🎋🎋🎋🎋🎋🎋🎋', '🎋🎋🎋🎋🎋🎋🎋🎋🎋'],
            dot: ['⚫', '⚫⚫', '⚫⚫⚫', '⚫⚫⚫⚫', '⚫⚫⚫⚫⚫', '⚫⚫⚫⚫⚫⚫', '⚫⚫⚫⚫⚫⚫⚫', '⚫⚫⚫⚫⚫⚫⚫⚫', '⚫⚫⚫⚫⚫⚫⚫⚫⚫'],
            character: ['萬', '二萬', '三萬', '四萬', '五萬', '六萬', '七萬', '八萬', '九萬'],
            wind: ['東', '南', '西', '北'],
            dragon: ['中', '發', '⬜']
        };
        return symbols[this.suit][this.value - 1] || '?';
    }
}

class TileFactory {
    static createFullSet() {
        const tiles = [];
        let id = 0;

        // Create 4 copies of each tile
        for (let copy = 0; copy < 4; copy++) {
            // Suited tiles (bamboo, character, dot)
            ['bamboo', 'character', 'dot'].forEach(suit => {
                for (let value = 1; value <= 9; value++) {
                    tiles.push(new Tile(suit, value, id++));
                }
            });

            // Wind tiles
            for (let value = 1; value <= 4; value++) {
                tiles.push(new Tile('wind', value, id++));
            }

            // Dragon tiles
            for (let value = 1; value <= 3; value++) {
                tiles.push(new Tile('dragon', value, id++));
            }
        }

        return tiles;
    }

    static shuffle(tiles) {
        const shuffled = [...tiles];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// =============================================================================
// HAND ANALYSIS
// =============================================================================

class HandAnalyzer {
    static isPair(tiles) {
        return tiles.length === 2 && tiles[0].equals(tiles[1]);
    }

    static isPung(tiles) {
        return tiles.length === 3 &&
               tiles[0].equals(tiles[1]) &&
               tiles[1].equals(tiles[2]);
    }

    static isKong(tiles) {
        return tiles.length === 4 &&
               tiles[0].equals(tiles[1]) &&
               tiles[1].equals(tiles[2]) &&
               tiles[2].equals(tiles[3]);
    }

    static isChow(tiles) {
        if (tiles.length !== 3) return false;
        if (tiles[0].isHonor()) return false;
        if (tiles[0].suit !== tiles[1].suit || tiles[1].suit !== tiles[2].suit) return false;

        const values = tiles.map(t => t.value).sort((a, b) => a - b);
        return values[1] === values[0] + 1 && values[2] === values[1] + 1;
    }

    static sortHand(tiles) {
        return [...tiles].sort((a, b) => {
            const suitOrder = { bamboo: 0, character: 1, dot: 2, wind: 3, dragon: 4 };
            if (suitOrder[a.suit] !== suitOrder[b.suit]) {
                return suitOrder[a.suit] - suitOrder[b.suit];
            }
            return a.value - b.value;
        });
    }

    static isWinningHand(tiles) {
        if (tiles.length !== 14) return false;

        // Try to find a valid decomposition
        return this.findValidDecomposition(tiles);
    }

    static findValidDecomposition(tiles, sets = [], pairFound = false) {
        if (tiles.length === 0) {
            return pairFound && sets.length === 4;
        }

        const sorted = this.sortHand(tiles);
        const first = sorted[0];

        // Try to form a pair
        if (!pairFound) {
            const pairIndex = sorted.findIndex((t, i) => i > 0 && t.equals(first));
            if (pairIndex !== -1) {
                const remaining = sorted.filter((_, i) => i !== 0 && i !== pairIndex);
                if (this.findValidDecomposition(remaining, sets, true)) {
                    return true;
                }
            }
        }

        // Try to form a pung
        const pungIndices = sorted.reduce((acc, t, i) => {
            if (t.equals(first)) acc.push(i);
            return acc;
        }, []);

        if (pungIndices.length >= 3) {
            const remaining = sorted.filter((_, i) => !pungIndices.slice(0, 3).includes(i));
            if (this.findValidDecomposition(remaining, [...sets, 'pung'], pairFound)) {
                return true;
            }
        }

        // Try to form a chow
        if (!first.isHonor()) {
            const next = sorted.find(t => t.suit === first.suit && t.value === first.value + 1);
            const nextNext = sorted.find(t => t.suit === first.suit && t.value === first.value + 2);

            if (next && nextNext) {
                const remaining = sorted.filter(t =>
                    t !== first && t !== next && t !== nextNext
                );
                if (this.findValidDecomposition(remaining, [...sets, 'chow'], pairFound)) {
                    return true;
                }
            }
        }

        return false;
    }

    static getWaitingTiles(tiles) {
        if (tiles.length !== 13) return [];

        const allTiles = TileFactory.createFullSet();
        const waiting = [];

        for (const tile of allTiles) {
            const testHand = [...tiles, tile];
            if (this.isWinningHand(testHand)) {
                if (!waiting.some(w => w.equals(tile))) {
                    waiting.push(tile);
                }
            }
        }

        return waiting;
    }
}

// =============================================================================
// GAME ENGINE
// =============================================================================

class MahjongEngine {
    constructor() {
        this.state = new MahjongGameState();
        this.eventListeners = new Map();
    }

    // Event system
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => callback(data));
        }
    }

    // Game initialization
    initGame(playerCount = 4, playerNames = ['East', 'South', 'West', 'North']) {
        this.state = new MahjongGameState();

        // Create players
        this.state.players = playerNames.map((name, i) => ({
            name,
            wind: ['East', 'South', 'West', 'North'][i],
            hand: [],
            revealed: [],
            discarded: [],
            score: 0,
            isAI: i > 0 // Player 0 is human, others are AI
        }));

        // Create and shuffle wall
        this.state.wall = TileFactory.shuffle(TileFactory.createFullSet());

        // Deal initial hands
        this.state.players.forEach(player => {
            player.hand = [];
            for (let i = 0; i < 13; i++) {
                player.hand.push(this.state.wall.pop());
            }
            player.hand = HandAnalyzer.sortHand(player.hand);
        });

        this.state.gamePhase = 'playing';
        this.state.currentPlayer = 0; // East starts

        this.emit('gameInitialized', this.state);
        this.recordHistory('gameStart');
    }

    // Draw a tile from the wall
    drawTile(playerIndex) {
        if (playerIndex < 0 || playerIndex >= this.state.players.length) {
            throw new Error('Invalid player index');
        }

        if (this.state.wall.length === 0) {
            this.emit('wallEmpty', {});
            return null;
        }

        const tile = this.state.wall.pop();
        this.state.players[playerIndex].hand.push(tile);
        this.state.players[playerIndex].hand = HandAnalyzer.sortHand(this.state.players[playerIndex].hand);

        this.emit('tileDrawn', { playerIndex, tile });
        this.recordHistory('draw', { playerIndex, tileId: tile.id });

        return tile;
    }

    // Discard a tile
    discardTile(playerIndex, tileIndex) {
        const player = this.state.players[playerIndex];

        if (tileIndex < 0 || tileIndex >= player.hand.length) {
            throw new Error('Invalid tile index');
        }

        const tile = player.hand.splice(tileIndex, 1)[0];
        player.discarded.push(tile);
        this.state.discardPile.push(tile);

        this.emit('tileDiscarded', { playerIndex, tile });
        this.recordHistory('discard', { playerIndex, tileId: tile.id });

        // Check if anyone can claim this tile
        this.checkClaims(tile, playerIndex);

        return tile;
    }

    // Check for valid claims (pung, chow, win)
    checkClaims(tile, discardingPlayer) {
        const claims = [];

        this.state.players.forEach((player, i) => {
            if (i === discardingPlayer) return;

            // Check for win
            const testHand = [...player.hand, tile];
            if (HandAnalyzer.isWinningHand(testHand)) {
                claims.push({ type: 'win', playerIndex: i, priority: 3 });
            }

            // Check for pung
            const matching = player.hand.filter(t => t.equals(tile));
            if (matching.length >= 2) {
                claims.push({ type: 'pung', playerIndex: i, priority: 2 });
            }

            // Check for chow (only next player)
            if (i === (discardingPlayer + 1) % this.state.players.length && !tile.isHonor()) {
                const canChow = this.canFormChow(player.hand, tile);
                if (canChow) {
                    claims.push({ type: 'chow', playerIndex: i, priority: 1 });
                }
            }
        });

        if (claims.length > 0) {
            this.emit('claimAvailable', { tile, claims });
        }

        return claims;
    }

    canFormChow(hand, tile) {
        if (tile.isHonor()) return false;

        const sameSuit = hand.filter(t => t.suit === tile.suit);

        // Check for sequences
        const hasLower2 = sameSuit.some(t => t.value === tile.value - 2);
        const hasLower1 = sameSuit.some(t => t.value === tile.value - 1);
        const hasHigher1 = sameSuit.some(t => t.value === tile.value + 1);
        const hasHigher2 = sameSuit.some(t => t.value === tile.value + 2);

        return (hasLower2 && hasLower1) || (hasLower1 && hasHigher1) || (hasHigher1 && hasHigher2);
    }

    // Declare win
    declareWin(playerIndex) {
        const player = this.state.players[playerIndex];

        if (!HandAnalyzer.isWinningHand(player.hand)) {
            throw new Error('Invalid winning hand');
        }

        this.state.winner = playerIndex;
        this.state.gamePhase = 'ended';

        const score = this.calculateScore(player.hand);
        player.score += score;

        this.emit('gameEnded', { winner: playerIndex, score });
        this.recordHistory('win', { playerIndex, score });
    }

    // Calculate score (simplified)
    calculateScore(hand) {
        let score = 10; // Base score

        // Count pungs and kongs
        const sorted = HandAnalyzer.sortHand(hand);
        // Simplified scoring - in real game this is much more complex

        return score;
    }

    // Move to next turn
    nextTurn() {
        this.state.currentPlayer = (this.state.currentPlayer + 1) % this.state.players.length;
        this.state.turnNumber++;
        this.emit('turnChanged', { currentPlayer: this.state.currentPlayer });
    }

    // History management
    recordHistory(action, data = {}) {
        this.state.history.push({
            turn: this.state.turnNumber,
            action,
            data,
            timestamp: Date.now()
        });
    }

    // Save/Load
    saveGame() {
        const saveData = this.state.toJSON();
        localStorage.setItem('mahjongGame', JSON.stringify(saveData));
        this.emit('gameSaved', saveData);
    }

    loadGame() {
        const saved = localStorage.getItem('mahjongGame');
        if (saved) {
            this.state = MahjongGameState.fromJSON(JSON.parse(saved));
            this.emit('gameLoaded', this.state);
            return true;
        }
        return false;
    }

    // Replay system
    getHistory() {
        return this.state.history;
    }

    replayMove(moveIndex) {
        if (moveIndex < 0 || moveIndex >= this.state.history.length) {
            return null;
        }
        return this.state.history[moveIndex];
    }
}

// =============================================================================
// AI PLAYER
// =============================================================================

class MahjongAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
    }

    // Decide which tile to discard
    chooseDiscard(hand) {
        const sorted = HandAnalyzer.sortHand(hand);

        // Simple strategy: discard tiles that don't contribute to sets
        const scores = sorted.map((tile, i) => ({
            tile,
            index: i,
            score: this.evaluateTile(tile, sorted)
        }));

        scores.sort((a, b) => a.score - b.score);
        return scores[0].index;
    }

    evaluateTile(tile, hand) {
        let score = 0;

        // Count matching tiles (potential for pung)
        const matching = hand.filter(t => t.equals(tile)).length;
        score += matching * 10;

        // Check for sequential potential (chow)
        if (!tile.isHonor()) {
            const sameSuit = hand.filter(t => t.suit === tile.suit);
            const near = sameSuit.filter(t => Math.abs(t.value - tile.value) <= 2);
            score += near.length * 5;
        }

        // Prefer keeping simples (more flexible)
        if (tile.isSimple()) {
            score += 3;
        }

        return score;
    }

    // Decide whether to claim a tile
    shouldClaim(hand, tile, claimType) {
        if (claimType === 'win') return true;

        const testHand = [...hand, tile];
        const waiting = HandAnalyzer.getWaitingTiles(testHand.slice(0, -1));

        // Claim if it gets us close to winning
        return waiting.length > 0 && Math.random() > 0.3;
    }

    makeMove(engine, playerIndex) {
        const player = engine.state.players[playerIndex];

        // Draw a tile
        engine.drawTile(playerIndex);

        // Check if we can win
        if (HandAnalyzer.isWinningHand(player.hand)) {
            setTimeout(() => engine.declareWin(playerIndex), 500);
            return;
        }

        // Choose which tile to discard
        const discardIndex = this.chooseDiscard(player.hand);

        setTimeout(() => {
            engine.discardTile(playerIndex, discardIndex);
            engine.nextTurn();
        }, 1000 + Math.random() * 1000); // Random delay for realism
    }
}

// =============================================================================
// EXPORT FOR USE IN BROWSER
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MahjongEngine,
        MahjongGameState,
        Tile,
        TileFactory,
        HandAnalyzer,
        MahjongAI
    };
}
