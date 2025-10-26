/**
 * TileRenderer.test.js
 * Unit tests for the Mahjong Tile Renderer
 *
 * Test Coverage:
 * - Tile rendering (all types and values)
 * - Performance benchmarks
 * - Accessibility compliance
 * - Interactive features
 * - Cache management
 * - Error handling
 */

// Mock DOM environment for Node.js testing
if (typeof document === 'undefined') {
    global.document = {
        createElement: () => ({
            className: '',
            innerHTML: '',
            setAttribute: () => {},
            addEventListener: () => {},
            classList: {
                add: () => {},
                remove: () => {},
                toggle: () => {},
                contains: () => false
            },
            appendChild: () => {}
        }),
        createDocumentFragment: () => ({
            appendChild: () => {}
        })
    };
}

/**
 * Test Suite: Basic Rendering
 */
function testBasicRendering() {
    console.log('\n=== Testing Basic Rendering ===');
    const renderer = new TileRenderer({ size: 'medium' });
    let passed = 0;
    let failed = 0;

    // Test 1: Renderer instantiation
    try {
        if (renderer instanceof TileRenderer) {
            console.log('✓ Renderer instantiates correctly');
            passed++;
        } else {
            throw new Error('Invalid instance');
        }
    } catch (e) {
        console.log('✗ Renderer instantiation failed:', e.message);
        failed++;
    }

    // Test 2: Bamboo tiles (1-9)
    try {
        for (let i = 1; i <= 9; i++) {
            const svg = renderer.renderTile('bamboo', i);
            if (!svg || !svg.includes('<svg')) {
                throw new Error(`Bamboo ${i} failed`);
            }
        }
        console.log('✓ All bamboo tiles render correctly (1-9)');
        passed++;
    } catch (e) {
        console.log('✗ Bamboo tile rendering failed:', e.message);
        failed++;
    }

    // Test 3: Dot tiles (1-9)
    try {
        for (let i = 1; i <= 9; i++) {
            const svg = renderer.renderTile('dots', i);
            if (!svg || !svg.includes('<svg')) {
                throw new Error(`Dot ${i} failed`);
            }
        }
        console.log('✓ All dot tiles render correctly (1-9)');
        passed++;
    } catch (e) {
        console.log('✗ Dot tile rendering failed:', e.message);
        failed++;
    }

    // Test 4: Character tiles (1-9)
    try {
        for (let i = 1; i <= 9; i++) {
            const svg = renderer.renderTile('characters', i);
            if (!svg || !svg.includes('<svg')) {
                throw new Error(`Character ${i} failed`);
            }
        }
        console.log('✓ All character tiles render correctly (1-9)');
        passed++;
    } catch (e) {
        console.log('✗ Character tile rendering failed:', e.message);
        failed++;
    }

    // Test 5: Wind tiles
    try {
        const winds = ['east', 'south', 'west', 'north'];
        winds.forEach(wind => {
            const svg = renderer.renderTile('wind', wind);
            if (!svg || !svg.includes('<svg')) {
                throw new Error(`Wind ${wind} failed`);
            }
        });
        console.log('✓ All wind tiles render correctly');
        passed++;
    } catch (e) {
        console.log('✗ Wind tile rendering failed:', e.message);
        failed++;
    }

    // Test 6: Dragon tiles
    try {
        const dragons = ['red', 'green', 'white'];
        dragons.forEach(dragon => {
            const svg = renderer.renderTile('dragon', dragon);
            if (!svg || !svg.includes('<svg')) {
                throw new Error(`Dragon ${dragon} failed`);
            }
        });
        console.log('✓ All dragon tiles render correctly');
        passed++;
    } catch (e) {
        console.log('✗ Dragon tile rendering failed:', e.message);
        failed++;
    }

    return { passed, failed };
}

/**
 * Test Suite: Performance
 */
function testPerformance() {
    console.log('\n=== Testing Performance ===');
    const renderer = new TileRenderer({ size: 'medium' });
    let passed = 0;
    let failed = 0;

    // Test 1: Single tile render time < 10ms
    try {
        const start = performance.now();
        renderer.renderTile('bamboo', 5);
        const end = performance.now();
        const duration = end - start;

        if (duration < 10) {
            console.log(`✓ Single tile renders in ${duration.toFixed(2)}ms (< 10ms)`);
            passed++;
        } else {
            throw new Error(`Too slow: ${duration.toFixed(2)}ms`);
        }
    } catch (e) {
        console.log('✗ Single tile render time failed:', e.message);
        failed++;
    }

    // Test 2: Batch render performance
    try {
        const start = performance.now();
        for (let i = 1; i <= 9; i++) {
            renderer.renderTile('bamboo', i);
        }
        const end = performance.now();
        const duration = end - start;

        if (duration < 50) {
            console.log(`✓ Batch render 9 tiles in ${duration.toFixed(2)}ms (< 50ms)`);
            passed++;
        } else {
            throw new Error(`Too slow: ${duration.toFixed(2)}ms`);
        }
    } catch (e) {
        console.log('✗ Batch render performance failed:', e.message);
        failed++;
    }

    // Test 3: Cache effectiveness
    try {
        renderer.clearCache();
        const firstRender = performance.now();
        renderer.renderTile('bamboo', 5);
        const firstEnd = performance.now();
        const firstDuration = firstEnd - firstRender;

        const secondRender = performance.now();
        renderer.renderTile('bamboo', 5);
        const secondEnd = performance.now();
        const secondDuration = secondEnd - secondRender;

        if (secondDuration < firstDuration) {
            console.log(`✓ Cache improves performance (${firstDuration.toFixed(2)}ms → ${secondDuration.toFixed(2)}ms)`);
            passed++;
        } else {
            throw new Error('Cache not effective');
        }
    } catch (e) {
        console.log('✗ Cache effectiveness test failed:', e.message);
        failed++;
    }

    // Test 4: Memory usage < 50KB
    try {
        renderer.generateAllTiles();
        const cacheSize = renderer.getCacheSize();

        if (cacheSize < 50000) {
            console.log(`✓ Total cache size: ${(cacheSize / 1024).toFixed(2)} KB (< 50KB)`);
            passed++;
        } else {
            throw new Error(`Too large: ${(cacheSize / 1024).toFixed(2)} KB`);
        }
    } catch (e) {
        console.log('✗ Memory usage test failed:', e.message);
        failed++;
    }

    return { passed, failed };
}

/**
 * Test Suite: Accessibility
 */
function testAccessibility() {
    console.log('\n=== Testing Accessibility ===');
    const renderer = new TileRenderer({ size: 'medium' });
    let passed = 0;
    let failed = 0;

    // Test 1: SVG has proper aria-label
    try {
        const svg = renderer.renderTile('bamboo', 5);
        if (svg.includes('aria-label')) {
            console.log('✓ SVG includes aria-label attribute');
            passed++;
        } else {
            throw new Error('Missing aria-label');
        }
    } catch (e) {
        console.log('✗ aria-label test failed:', e.message);
        failed++;
    }

    // Test 2: SVG has role="img"
    try {
        const svg = renderer.renderTile('dots', 3);
        if (svg.includes('role="img"')) {
            console.log('✓ SVG has role="img" for screen readers');
            passed++;
        } else {
            throw new Error('Missing role attribute');
        }
    } catch (e) {
        console.log('✗ SVG role test failed:', e.message);
        failed++;
    }

    // Test 3: Tile names are descriptive
    try {
        const renderer2 = new TileRenderer();
        const names = [
            renderer2._getTileName('bamboo', 5),
            renderer2._getTileName('wind', 'east'),
            renderer2._getTileName('dragon', 'red')
        ];

        const allValid = names.every(name => name && name.length > 3);
        if (allValid) {
            console.log('✓ All tile names are descriptive:', names.join(', '));
            passed++;
        } else {
            throw new Error('Invalid tile names');
        }
    } catch (e) {
        console.log('✗ Tile name test failed:', e.message);
        failed++;
    }

    // Test 4: Element has proper attributes
    try {
        if (typeof document !== 'undefined') {
            const element = renderer.createTileElement('characters', 7);
            const hasRole = element.getAttribute('role') === 'button';
            const hasTabIndex = element.getAttribute('tabindex') === '0';
            const hasAriaLabel = element.hasAttribute('aria-label');

            if (hasRole && hasTabIndex && hasAriaLabel) {
                console.log('✓ Tile element has proper accessibility attributes');
                passed++;
            } else {
                throw new Error('Missing accessibility attributes');
            }
        } else {
            console.log('⊘ Skipping DOM element test (no DOM available)');
        }
    } catch (e) {
        console.log('✗ Element attributes test failed:', e.message);
        failed++;
    }

    return { passed, failed };
}

/**
 * Test Suite: Size Options
 */
function testSizeOptions() {
    console.log('\n=== Testing Size Options ===');
    let passed = 0;
    let failed = 0;

    // Test 1: All size presets work
    try {
        const sizes = ['small', 'medium', 'large', 'xlarge'];
        sizes.forEach(size => {
            const renderer = new TileRenderer({ size });
            const svg = renderer.renderTile('bamboo', 5);
            if (!svg.includes('<svg')) {
                throw new Error(`Size ${size} failed`);
            }
        });
        console.log('✓ All size presets render correctly');
        passed++;
    } catch (e) {
        console.log('✗ Size presets test failed:', e.message);
        failed++;
    }

    // Test 2: Dimensions are correct
    try {
        const renderer = new TileRenderer({ size: 'medium' });
        const dims = renderer.getDimensions();
        if (dims.width === 60 && dims.height === 90) {
            console.log('✓ Medium size dimensions correct (60x90)');
            passed++;
        } else {
            throw new Error(`Wrong dimensions: ${dims.width}x${dims.height}`);
        }
    } catch (e) {
        console.log('✗ Dimensions test failed:', e.message);
        failed++;
    }

    // Test 3: Invalid size defaults to medium
    try {
        const renderer = new TileRenderer({ size: 'invalid' });
        const dims = renderer.getDimensions();
        if (dims.width === 60 && dims.height === 90) {
            console.log('✓ Invalid size defaults to medium');
            passed++;
        } else {
            throw new Error('Invalid size not handled');
        }
    } catch (e) {
        console.log('✗ Invalid size handling failed:', e.message);
        failed++;
    }

    return { passed, failed };
}

/**
 * Test Suite: Cache Management
 */
function testCacheManagement() {
    console.log('\n=== Testing Cache Management ===');
    const renderer = new TileRenderer({ size: 'medium' });
    let passed = 0;
    let failed = 0;

    // Test 1: Cache starts empty
    try {
        const newRenderer = new TileRenderer();
        if (newRenderer.getCacheSize() === 0) {
            console.log('✓ Cache starts empty');
            passed++;
        } else {
            throw new Error('Cache not empty on init');
        }
    } catch (e) {
        console.log('✗ Cache initialization test failed:', e.message);
        failed++;
    }

    // Test 2: Cache populates on render
    try {
        renderer.clearCache();
        renderer.renderTile('bamboo', 5);
        if (renderer.getCacheSize() > 0) {
            console.log('✓ Cache populates on render');
            passed++;
        } else {
            throw new Error('Cache not populated');
        }
    } catch (e) {
        console.log('✗ Cache population test failed:', e.message);
        failed++;
    }

    // Test 3: Cache clears correctly
    try {
        renderer.renderTile('bamboo', 1);
        renderer.renderTile('bamboo', 2);
        renderer.clearCache();
        if (renderer.getCacheSize() === 0) {
            console.log('✓ Cache clears correctly');
            passed++;
        } else {
            throw new Error('Cache not cleared');
        }
    } catch (e) {
        console.log('✗ Cache clearing test failed:', e.message);
        failed++;
    }

    // Test 4: generateAllTiles creates 42 tiles
    try {
        const newRenderer = new TileRenderer();
        const allTiles = newRenderer.generateAllTiles();
        const count =
            Object.keys(allTiles.bamboo).length +
            Object.keys(allTiles.dots).length +
            Object.keys(allTiles.characters).length +
            Object.keys(allTiles.wind).length +
            Object.keys(allTiles.dragon).length;

        if (count === 42) {
            console.log('✓ generateAllTiles creates all 42 unique tiles');
            passed++;
        } else {
            throw new Error(`Wrong count: ${count}`);
        }
    } catch (e) {
        console.log('✗ generateAllTiles test failed:', e.message);
        failed++;
    }

    return { passed, failed };
}

/**
 * Test Suite: Error Handling
 */
function testErrorHandling() {
    console.log('\n=== Testing Error Handling ===');
    const renderer = new TileRenderer({ size: 'medium' });
    let passed = 0;
    let failed = 0;

    // Test 1: Invalid tile type
    try {
        const svg = renderer.renderTile('invalid', 5);
        if (svg === '') {
            console.log('✓ Invalid tile type returns empty string');
            passed++;
        } else {
            throw new Error('Should return empty string');
        }
    } catch (e) {
        console.log('✗ Invalid tile type test failed:', e.message);
        failed++;
    }

    // Test 2: Invalid wind direction
    try {
        const svg = renderer.renderTile('wind', 'invalid');
        // Should return SVG but with empty content
        if (svg.includes('<svg')) {
            console.log('✓ Invalid wind direction handled gracefully');
            passed++;
        } else {
            throw new Error('Should still return SVG structure');
        }
    } catch (e) {
        console.log('✗ Invalid wind direction test failed:', e.message);
        failed++;
    }

    // Test 3: Invalid dragon color
    try {
        const svg = renderer.renderTile('dragon', 'invalid');
        if (svg.includes('<svg')) {
            console.log('✓ Invalid dragon color handled gracefully');
            passed++;
        } else {
            throw new Error('Should still return SVG structure');
        }
    } catch (e) {
        console.log('✗ Invalid dragon color test failed:', e.message);
        failed++;
    }

    return { passed, failed };
}

/**
 * Run all tests
 */
function runAllTests() {
    console.log('\n' + '='.repeat(50));
    console.log('MAHJONG TILE RENDERER - UNIT TESTS');
    console.log('='.repeat(50));

    const results = [];

    results.push(testBasicRendering());
    results.push(testPerformance());
    results.push(testAccessibility());
    results.push(testSizeOptions());
    results.push(testCacheManagement());
    results.push(testErrorHandling());

    // Calculate totals
    const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    const totalTests = totalPassed + totalFailed;

    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)`);
    console.log('='.repeat(50) + '\n');

    return totalFailed === 0;
}

// Run tests if executed directly
if (typeof require !== 'undefined' && require.main === module) {
    // Node.js environment
    const TileRenderer = require('./TileRenderer.js').TileRenderer;
    const success = runAllTests();
    process.exit(success ? 0 : 1);
} else if (typeof window !== 'undefined' && window.TileRenderer) {
    // Browser environment
    window.runTileRendererTests = runAllTests;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testBasicRendering,
        testPerformance,
        testAccessibility,
        testSizeOptions,
        testCacheManagement,
        testErrorHandling
    };
}
