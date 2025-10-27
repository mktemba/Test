/**
 * TileRenderer.js
 * Comprehensive SVG-based Mahjong tile rendering system
 *
 * Provides authentic, scalable, and accessible Mahjong tile graphics
 * Performance target: <10ms per tile render, <50KB total SVG definitions
 * WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation
 *
 * @module TileRenderer
 * @version 1.0.0
 */

/**
 * SVG definitions for reusable tile elements
 * Optimized for performance - definitions are reused across all tiles
 */
const SVG_DEFS = {
    // Bamboo stick pattern (reusable)
    bambooStick: `
        <g id="bamboo-stick">
            <rect x="0" y="0" width="8" height="40" rx="4" fill="#2d5016" stroke="#1a3009" stroke-width="0.5"/>
            <line x1="4" y1="5" x2="4" y2="35" stroke="#4a7c2a" stroke-width="1"/>
            <circle cx="4" cy="10" r="1" fill="#4a7c2a"/>
            <circle cx="4" cy="20" r="1" fill="#4a7c2a"/>
            <circle cx="4" cy="30" r="1" fill="#4a7c2a"/>
        </g>
    `,

    // Dot pattern (reusable)
    dotCircle: `
        <g id="dot-circle">
            <circle cx="0" cy="0" r="12" fill="#c41e3a" stroke="#8b0000" stroke-width="1.5"/>
            <circle cx="0" cy="0" r="8" fill="#ff4444" opacity="0.3"/>
        </g>
    `,

    // Tile background gradient
    tileBackground: `
        <defs>
            <linearGradient id="tile-bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#f5f5dc;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="tile-border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#d4d4d4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#a8a8a8;stop-opacity:1" />
            </linearGradient>
            <filter id="tile-shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
        </defs>
    `
};

/**
 * Chinese characters for character tiles
 */
const CHINESE_CHARACTERS = {
    1: '一萬',
    2: '二萬',
    3: '三萬',
    4: '四萬',
    5: '五萬',
    6: '六萬',
    7: '七萬',
    8: '八萬',
    9: '九萬'
};

/**
 * Wind direction characters
 */
const WIND_CHARACTERS = {
    east: { char: '東', color: '#c41e3a', name: 'East Wind' },
    south: { char: '南', color: '#2d5016', name: 'South Wind' },
    west: { char: '西', color: '#1e40af', name: 'West Wind' },
    north: { char: '北', color: '#1f2937', name: 'North Wind' }
};

/**
 * Dragon tile characters
 */
const DRAGON_CHARACTERS = {
    red: { char: '中', color: '#c41e3a', name: 'Red Dragon' },
    green: { char: '發', color: '#2d5016', name: 'Green Dragon' },
    white: { char: '⬜', color: '#1f2937', name: 'White Dragon', outline: true }
};

/**
 * Tile size presets in pixels
 */
const TILE_SIZES = {
    small: { width: 40, height: 60 },
    medium: { width: 60, height: 90 },
    large: { width: 80, height: 120 },
    xlarge: { width: 100, height: 150 }
};

/**
 * TileRenderer Class
 *
 * Main class for rendering Mahjong tiles as SVG
 *
 * @class
 * @example
 * const renderer = new TileRenderer({ size: 'medium', theme: 'classic' });
 * const tileElement = renderer.createTileElement('bamboo', 5);
 * document.body.appendChild(tileElement);
 */
class TileRenderer {
    /**
     * Create a new TileRenderer instance
     *
     * @param {Object} options - Configuration options
     * @param {string} options.size - Tile size: 'small', 'medium', 'large', 'xlarge'
     * @param {string} options.theme - Visual theme: 'classic', 'modern'
     * @param {boolean} options.enableShadow - Enable drop shadow effect
     * @param {boolean} options.enableHover - Enable hover effects
     */
    constructor(options = {}) {
        this.size = options.size || 'medium';
        this.theme = options.theme || 'classic';
        this.enableShadow = options.enableShadow !== false;
        this.enableHover = options.enableHover !== false;

        // Performance optimization: Cache rendered tiles
        this.cache = new Map();

        // SVG namespace
        this.svgNS = 'http://www.w3.org/2000/svg';

        // Validate size
        if (!TILE_SIZES[this.size]) {
            console.warn(`Invalid size "${this.size}", defaulting to "medium"`);
            this.size = 'medium';
        }
    }

    /**
     * Get tile dimensions for current size
     *
     * @returns {Object} Object with width and height properties
     */
    getDimensions() {
        return { ...TILE_SIZES[this.size] };
    }

    /**
     * Generate SVG string for tile background
     *
     * @private
     * @param {number} width - Tile width
     * @param {number} height - Tile height
     * @returns {string} SVG string for tile background
     */
    _generateBackground(width, height) {
        const cornerRadius = Math.min(width, height) * 0.08;
        const borderWidth = 2;

        return `
            <rect
                x="${borderWidth}"
                y="${borderWidth}"
                width="${width - borderWidth * 2}"
                height="${height - borderWidth * 2}"
                rx="${cornerRadius}"
                ry="${cornerRadius}"
                fill="url(#tile-bg-gradient)"
                stroke="url(#tile-border-gradient)"
                stroke-width="${borderWidth}"
                ${this.enableShadow ? 'filter="url(#tile-shadow)"' : ''}
            />
        `;
    }

    /**
     * Generate SVG for bamboo tiles (1-9)
     *
     * @private
     * @param {number} value - Tile value (1-9)
     * @param {number} width - Tile width
     * @param {number} height - Tile height
     * @returns {string} SVG content
     */
    _generateBambooTile(value, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const stickWidth = 8;
        const stickHeight = 40;
        const scale = Math.min(width / 60, height / 90);

        let sticks = '';

        if (value === 1) {
            // Single centered bamboo
            sticks = `
                <g transform="translate(${centerX}, ${centerY}) scale(${scale * 1.2})">
                    <rect x="-4" y="-20" width="8" height="40" rx="4" fill="#2d5016" stroke="#1a3009" stroke-width="0.5"/>
                    <line x1="0" y1="-15" x2="0" y2="15" stroke="#4a7c2a" stroke-width="1"/>
                    <circle cx="0" cy="-10" r="1" fill="#4a7c2a"/>
                    <circle cx="0" cy="0" r="1" fill="#4a7c2a"/>
                    <circle cx="0" cy="10" r="1" fill="#4a7c2a"/>
                </g>
            `;
        } else if (value === 2) {
            // Two bamboos
            const spacing = 12 * scale;
            for (let i = 0; i < 2; i++) {
                const x = centerX + (i - 0.5) * spacing;
                sticks += `
                    <g transform="translate(${x}, ${centerY}) scale(${scale})">
                        <rect x="-4" y="-20" width="8" height="40" rx="4" fill="#2d5016" stroke="#1a3009" stroke-width="0.5"/>
                        <line x1="0" y1="-15" x2="0" y2="15" stroke="#4a7c2a" stroke-width="1"/>
                    </g>
                `;
            }
        } else if (value === 3) {
            // Three bamboos in triangle
            const spacing = 12 * scale;
            sticks += `
                <g transform="translate(${centerX}, ${centerY - 8 * scale}) scale(${scale})">
                    <rect x="-4" y="-20" width="8" height="40" rx="4" fill="#2d5016" stroke="#1a3009" stroke-width="0.5"/>
                </g>
            `;
            for (let i = 0; i < 2; i++) {
                const x = centerX + (i - 0.5) * spacing;
                sticks += `
                    <g transform="translate(${x}, ${centerY + 8 * scale}) scale(${scale})">
                        <rect x="-4" y="-20" width="8" height="40" rx="4" fill="#2d5016" stroke="#1a3009" stroke-width="0.5"/>
                    </g>
                `;
            }
        } else if (value === 4) {
            // Four bamboos in square
            const spacing = 12 * scale;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    const x = centerX + (i - 0.5) * spacing;
                    const y = centerY + (j - 0.5) * spacing;
                    sticks += `
                        <g transform="translate(${x}, ${y}) scale(${scale})">
                            <rect x="-4" y="-20" width="8" height="40" rx="4" fill="#2d5016" stroke="#1a3009" stroke-width="0.5"/>
                        </g>
                    `;
                }
            }
        } else if (value === 5) {
            // Five bamboos (4 corners + center)
            const spacing = 12 * scale;
            sticks += `
                <g transform="translate(${centerX}, ${centerY}) scale(${scale})">
                    <rect x="-4" y="-20" width="8" height="40" rx="4" fill="#2d5016" stroke="#1a3009" stroke-width="0.5"/>
                </g>
            `;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    const x = centerX + (i - 0.5) * spacing;
                    const y = centerY + (j - 0.5) * spacing;
                    sticks += `
                        <g transform="translate(${x}, ${y}) scale(${scale * 0.8})">
                            <rect x="-4" y="-20" width="8" height="40" rx="4" fill="#2d5016" stroke="#1a3009" stroke-width="0.5"/>
                        </g>
                    `;
                }
            }
        } else if (value >= 6 && value <= 9) {
            // 6-9: arranged in rows
            const rows = value <= 6 ? 2 : 3;
            const cols = value <= 6 ? 3 : 3;
            const spacing = 10 * scale;
            let count = 0;

            for (let i = 0; i < rows && count < value; i++) {
                const itemsInRow = value === 7 && i === 0 ? 1 : value === 8 && i === 2 ? 2 : 3;
                const startX = centerX - (itemsInRow - 1) * spacing / 2;

                for (let j = 0; j < itemsInRow && count < value; j++) {
                    const x = startX + j * spacing;
                    const y = centerY + (i - (rows - 1) / 2) * spacing;
                    sticks += `
                        <g transform="translate(${x}, ${y}) scale(${scale * 0.7})">
                            <rect x="-4" y="-20" width="8" height="40" rx="4" fill="#2d5016" stroke="#1a3009" stroke-width="0.5"/>
                        </g>
                    `;
                    count++;
                }
            }
        }

        return sticks;
    }

    /**
     * Generate SVG for dot tiles (1-9)
     *
     * @private
     * @param {number} value - Tile value (1-9)
     * @param {number} width - Tile width
     * @param {number} height - Tile height
     * @returns {string} SVG content
     */
    _generateDotTile(value, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = 12;
        const scale = Math.min(width / 60, height / 90);
        const radius = baseRadius * scale;

        let dots = '';

        // Dot patterns based on dice/domino layouts
        const positions = {
            1: [[0, 0]],
            2: [[-1, -1], [1, 1]],
            3: [[-1, -1], [0, 0], [1, 1]],
            4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
            5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
            6: [[-1, -1], [0, -1], [1, -1], [-1, 1], [0, 1], [1, 1]],
            7: [[-1, -1], [0, -1], [1, -1], [0, 0], [-1, 1], [0, 1], [1, 1]],
            8: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
            9: [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]
        };

        const spacing = radius * 2.2;

        positions[value].forEach(([dx, dy]) => {
            const x = centerX + dx * spacing;
            const y = centerY + dy * spacing;

            dots += `
                <g transform="translate(${x}, ${y})">
                    <circle cx="0" cy="0" r="${radius}" fill="#c41e3a" stroke="#8b0000" stroke-width="1.5"/>
                    <circle cx="0" cy="0" r="${radius * 0.6}" fill="#ff4444" opacity="0.3"/>
                </g>
            `;
        });

        return dots;
    }

    /**
     * Generate SVG for character tiles (1-9)
     *
     * @private
     * @param {number} value - Tile value (1-9)
     * @param {number} width - Tile width
     * @param {number} height - Tile height
     * @returns {string} SVG content
     */
    _generateCharacterTile(value, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const fontSize = Math.min(width, height) * 0.45;

        return `
            <text
                x="${centerX}"
                y="${centerY + fontSize * 0.35}"
                font-family="'Noto Sans SC', 'Microsoft YaHei', SimHei, sans-serif"
                font-size="${fontSize}px"
                font-weight="bold"
                fill="#1f2937"
                text-anchor="middle"
                dominant-baseline="middle"
            >${CHINESE_CHARACTERS[value]}</text>
        `;
    }

    /**
     * Generate SVG for wind tiles
     *
     * @private
     * @param {string} direction - Wind direction: 'east', 'south', 'west', 'north'
     * @param {number} width - Tile width
     * @param {number} height - Tile height
     * @returns {string} SVG content
     */
    _generateWindTile(direction, width, height) {
        const wind = WIND_CHARACTERS[direction];
        if (!wind) {
            console.error(`Invalid wind direction: ${direction}`);
            return '';
        }

        const centerX = width / 2;
        const centerY = height / 2;
        const fontSize = Math.min(width, height) * 0.5;

        return `
            <text
                x="${centerX}"
                y="${centerY + fontSize * 0.35}"
                font-family="'Noto Sans SC', 'Microsoft YaHei', SimHei, sans-serif"
                font-size="${fontSize}px"
                font-weight="bold"
                fill="${wind.color}"
                text-anchor="middle"
                dominant-baseline="middle"
            >${wind.char}</text>
        `;
    }

    /**
     * Generate SVG for dragon tiles
     *
     * @private
     * @param {string} color - Dragon color: 'red', 'green', 'white'
     * @param {number} width - Tile width
     * @param {number} height - Tile height
     * @returns {string} SVG content
     */
    _generateDragonTile(color, width, height) {
        const dragon = DRAGON_CHARACTERS[color];
        if (!dragon) {
            console.error(`Invalid dragon color: ${color}`);
            return '';
        }

        const centerX = width / 2;
        const centerY = height / 2;
        const fontSize = Math.min(width, height) * 0.5;

        if (color === 'white') {
            // White dragon: special border design
            const boxSize = Math.min(width, height) * 0.6;
            return `
                <rect
                    x="${centerX - boxSize / 2}"
                    y="${centerY - boxSize / 2}"
                    width="${boxSize}"
                    height="${boxSize}"
                    fill="none"
                    stroke="${dragon.color}"
                    stroke-width="3"
                    rx="4"
                />
            `;
        }

        return `
            <text
                x="${centerX}"
                y="${centerY + fontSize * 0.35}"
                font-family="'Noto Sans SC', 'Microsoft YaHei', SimHei, sans-serif"
                font-size="${fontSize}px"
                font-weight="bold"
                fill="${dragon.color}"
                text-anchor="middle"
                dominant-baseline="middle"
            >${dragon.char}</text>
        `;
    }

    /**
     * Get tile name for accessibility
     *
     * @private
     * @param {string} tileType - Type of tile
     * @param {string|number} tileValue - Value of tile
     * @returns {string} Human-readable tile name
     */
    _getTileName(tileType, tileValue) {
        const typeNames = {
            bamboo: 'Bamboo',
            dots: 'Dot',
            characters: 'Character',
            wind: 'Wind',
            dragon: 'Dragon'
        };

        const typeName = typeNames[tileType] || tileType;

        if (tileType === 'wind') {
            const wind = WIND_CHARACTERS[tileValue];
            return wind ? wind.name : `${tileValue} ${typeName}`;
        }

        if (tileType === 'dragon') {
            const dragon = DRAGON_CHARACTERS[tileValue];
            return dragon ? dragon.name : `${tileValue} ${typeName}`;
        }

        return `${tileValue} ${typeName}`;
    }

    /**
     * Render a tile as SVG string
     *
     * @param {string} tileType - Type of tile: 'bamboo', 'dots', 'characters', 'wind', 'dragon'
     * @param {string|number} tileValue - Value of the tile
     * @returns {string} Complete SVG string
     *
     * @example
     * const svg = renderer.renderTile('bamboo', 5);
     */
    renderTile(tileType, tileValue) {
        // Check cache first
        const cacheKey = `${tileType}-${tileValue}-${this.size}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const { width, height } = this.getDimensions();
        let content = '';

        // Generate tile-specific content
        switch (tileType) {
            case 'bamboo':
                content = this._generateBambooTile(parseInt(tileValue), width, height);
                break;
            case 'dots':
                content = this._generateDotTile(parseInt(tileValue), width, height);
                break;
            case 'characters':
                content = this._generateCharacterTile(parseInt(tileValue), width, height);
                break;
            case 'wind':
                content = this._generateWindTile(tileValue, width, height);
                break;
            case 'dragon':
                content = this._generateDragonTile(tileValue, width, height);
                break;
            default:
                console.error(`Unknown tile type: ${tileType}`);
                return '';
        }

        // Compose complete SVG
        const svg = `
            <svg
                xmlns="${this.svgNS}"
                width="${width}"
                height="${height}"
                viewBox="0 0 ${width} ${height}"
                role="img"
                aria-label="${this._getTileName(tileType, tileValue)}"
            >
                ${SVG_DEFS.tileBackground}
                ${this._generateBackground(width, height)}
                ${content}
            </svg>
        `;

        // Cache the result
        this.cache.set(cacheKey, svg);

        return svg;
    }

    /**
     * Create DOM element for tile
     *
     * @param {string} tileType - Type of tile
     * @param {string|number} tileValue - Value of tile
     * @param {Object} options - Additional options
     * @param {boolean} options.interactive - Enable interactive states
     * @param {boolean} options.selected - Initially selected
     * @param {string} options.state - Tile state: 'normal', 'correct', 'incorrect'
     * @param {Function} options.onClick - Click handler
     * @returns {HTMLElement} Tile element
     *
     * @example
     * const tile = renderer.createTileElement('dots', 3, {
     *   interactive: true,
     *   onClick: () => console.log('Tile clicked')
     * });
     */
    createTileElement(tileType, tileValue, options = {}) {
        const container = document.createElement('div');
        container.className = 'tile';
        container.setAttribute('data-tile-type', tileType);
        container.setAttribute('data-tile-value', tileValue);
        container.setAttribute('role', 'button');
        container.setAttribute('tabindex', '0');
        container.setAttribute('aria-label', this._getTileName(tileType, tileValue));

        // Add SVG content
        const svg = this.renderTile(tileType, tileValue);
        container.innerHTML = svg;

        // Apply state classes
        if (options.selected) {
            container.classList.add('selected');
        }
        if (options.state) {
            container.classList.add(options.state);
        }

        // Add interactive behavior
        if (options.interactive !== false) {
            this._makeInteractive(container, options);
        }

        return container;
    }

    /**
     * Make tile interactive with proper accessibility
     *
     * @private
     * @param {HTMLElement} element - Tile element
     * @param {Object} options - Options including onClick handler
     */
    _makeInteractive(element, options) {
        // Click handler
        if (options.onClick) {
            element.addEventListener('click', (e) => {
                options.onClick(e, element);
            });
        }

        // Keyboard handler (Enter and Space)
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (options.onClick) {
                    options.onClick(e, element);
                }
            }
        });

        // Focus/blur for accessibility
        element.addEventListener('focus', () => {
            element.classList.add('focused');
        });

        element.addEventListener('blur', () => {
            element.classList.remove('focused');
        });
    }

    /**
     * Add tile to container
     *
     * @param {HTMLElement} container - Container element
     * @param {string} tileType - Type of tile
     * @param {string|number} tileValue - Value of tile
     * @param {Object} options - Tile options
     * @returns {HTMLElement} Created tile element
     *
     * @example
     * const container = document.getElementById('tile-container');
     * renderer.appendTile(container, 'bamboo', 7);
     */
    appendTile(container, tileType, tileValue, options = {}) {
        const tile = this.createTileElement(tileType, tileValue, options);
        container.appendChild(tile);
        return tile;
    }

    /**
     * Batch render multiple tiles (optimized for hands)
     *
     * @param {Array} tiles - Array of tile objects with type and value
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Rendering options
     * @returns {Array<HTMLElement>} Array of created tile elements
     *
     * @example
     * const tiles = [
     *   { type: 'bamboo', value: 1 },
     *   { type: 'dots', value: 5 },
     *   { type: 'characters', value: 9 }
     * ];
     * renderer.renderHand(tiles, document.getElementById('hand'));
     */
    renderHand(tiles, container, options = {}) {
        // Performance: Use document fragment for batch insertion
        const fragment = document.createDocumentFragment();
        const elements = [];

        tiles.forEach((tile, index) => {
            const element = this.createTileElement(tile.type, tile.value, {
                ...options,
                onClick: options.onTileClick ? (e, el) => options.onTileClick(e, el, index) : null
            });
            fragment.appendChild(element);
            elements.push(element);
        });

        container.appendChild(fragment);
        return elements;
    }

    /**
     * Update tile state (e.g., correct, incorrect, selected)
     *
     * @param {HTMLElement} tileElement - Tile element to update
     * @param {string} state - New state: 'normal', 'selected', 'correct', 'incorrect'
     *
     * @example
     * renderer.updateTileState(tileElement, 'correct');
     */
    updateTileState(tileElement, state) {
        // Remove all state classes
        tileElement.classList.remove('selected', 'correct', 'incorrect');

        // Add new state
        if (state && state !== 'normal') {
            tileElement.classList.add(state);
        }
    }

    /**
     * Clear tile cache (useful when changing themes or sizes)
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get estimated memory usage of cached tiles
     *
     * @returns {number} Approximate memory usage in bytes
     */
    getCacheSize() {
        let size = 0;
        this.cache.forEach(svg => {
            size += svg.length * 2; // Approximate 2 bytes per character
        });
        return size;
    }

    /**
     * Generate all tiles (useful for preloading)
     *
     * @returns {Object} Object with all tile SVGs by type
     */
    generateAllTiles() {
        const allTiles = {
            bamboo: {},
            dots: {},
            characters: {},
            wind: {},
            dragon: {}
        };

        // Generate numbered tiles (1-9)
        for (let i = 1; i <= 9; i++) {
            allTiles.bamboo[i] = this.renderTile('bamboo', i);
            allTiles.dots[i] = this.renderTile('dots', i);
            allTiles.characters[i] = this.renderTile('characters', i);
        }

        // Generate wind tiles
        ['east', 'south', 'west', 'north'].forEach(dir => {
            allTiles.wind[dir] = this.renderTile('wind', dir);
        });

        // Generate dragon tiles
        ['red', 'green', 'white'].forEach(color => {
            allTiles.dragon[color] = this.renderTile('dragon', color);
        });

        return allTiles;
    }
}

/**
 * Utility function to create a renderer with default settings
 *
 * @param {string} size - Tile size
 * @returns {TileRenderer} New renderer instance
 */
function createRenderer(size = 'medium') {
    return new TileRenderer({ size });
}

/**
 * Export for use in browser and Node.js environments
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TileRenderer,
        createRenderer,
        TILE_SIZES,
        CHINESE_CHARACTERS,
        WIND_CHARACTERS,
        DRAGON_CHARACTERS
    };
}

// ES6 module export
export {
    TileRenderer,
    createRenderer,
    TILE_SIZES,
    CHINESE_CHARACTERS,
    WIND_CHARACTERS,
    DRAGON_CHARACTERS
};

// Browser global export (for non-module usage)
if (typeof window !== 'undefined') {
    window.TileRenderer = TileRenderer;
    window.createRenderer = createRenderer;
}
