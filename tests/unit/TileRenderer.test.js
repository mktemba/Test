/**
 * Unit tests for TileRenderer
 * Tests tile rendering, interactions, and visual display
 */

describe('TileRenderer', () => {
  let TileRenderer;
  let renderer;
  let container;

  beforeEach(() => {
    // Clear module cache
    jest.resetModules();

    // Create a mock container element
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Import TileRenderer
    TileRenderer = require('../../src/lib/TileRenderer').default;
    renderer = new TileRenderer();
  });

  afterEach(() => {
    // Clean up DOM
    document.body.removeChild(container);
    if (renderer) {
      renderer.destroy();
    }
  });

  describe('Initialization', () => {
    test('should initialize with default options', () => {
      expect(renderer).toBeDefined();
      expect(renderer.options.size).toBe('medium');
      expect(renderer.options.style).toBe('traditional');
      expect(renderer.options.interactive).toBe(true);
    });

    test('should accept custom options', () => {
      const customRenderer = new TileRenderer({
        size: 'large',
        style: 'modern',
        interactive: false
      });

      expect(customRenderer.options.size).toBe('large');
      expect(customRenderer.options.style).toBe('modern');
      expect(customRenderer.options.interactive).toBe(false);
    });

    test('should validate options', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const invalidRenderer = new TileRenderer({
        size: 'invalid',
        style: 'unknown'
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(invalidRenderer.options.size).toBe('medium'); // Falls back to default
      consoleSpy.mockRestore();
    });
  });

  describe('Tile Rendering', () => {
    test('should render a single tile', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      expect(element).toBeDefined();
      expect(element.classList.contains('mahjong-tile')).toBe(true);
      expect(container.contains(element)).toBe(true);
    });

    test('should render multiple tiles', () => {
      const tiles = [
        { suit: 'bamboo', value: 1 },
        { suit: 'character', value: 9 },
        { suit: 'dot', value: 5 }
      ];

      const elements = renderer.renderTiles(tiles, container);

      expect(elements.length).toBe(3);
      expect(container.children.length).toBe(3);
    });

    test('should render honor tiles correctly', () => {
      const honorTiles = [
        { suit: 'dragon', value: 'red' },
        { suit: 'wind', value: 'east' }
      ];

      honorTiles.forEach(tile => {
        const element = renderer.renderTile(tile, container);
        expect(element.classList.contains('honor-tile')).toBe(true);
      });
    });

    test('should render flower tiles correctly', () => {
      const flowerTile = { suit: 'flower', value: 1 };
      const element = renderer.renderTile(flowerTile, container);

      expect(element.classList.contains('flower-tile')).toBe(true);
    });

    test('should apply correct size classes', () => {
      const sizes = ['small', 'medium', 'large'];

      sizes.forEach(size => {
        const sizeRenderer = new TileRenderer({ size });
        const tile = { suit: 'bamboo', value: 1 };
        const element = sizeRenderer.renderTile(tile, container);

        expect(element.classList.contains(`tile-${size}`)).toBe(true);
      });
    });
  });

  describe('Tile Interactions', () => {
    test('should handle tile click events', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const clickHandler = jest.fn();

      const element = renderer.renderTile(tile, container, {
        onClick: clickHandler
      });

      element.click();
      expect(clickHandler).toHaveBeenCalledWith(tile, element);
    });

    test('should handle tile hover events', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const hoverHandler = jest.fn();

      const element = renderer.renderTile(tile, container, {
        onHover: hoverHandler
      });

      const hoverEvent = new MouseEvent('mouseenter');
      element.dispatchEvent(hoverEvent);

      expect(hoverHandler).toHaveBeenCalledWith(tile, element);
    });

    test('should disable interactions when interactive is false', () => {
      const nonInteractiveRenderer = new TileRenderer({ interactive: false });
      const tile = { suit: 'bamboo', value: 1 };
      const clickHandler = jest.fn();

      const element = nonInteractiveRenderer.renderTile(tile, container, {
        onClick: clickHandler
      });

      element.click();
      expect(clickHandler).not.toHaveBeenCalled();
      expect(element.classList.contains('non-interactive')).toBe(true);
    });

    test('should support tile selection', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      renderer.selectTile(element);
      expect(element.classList.contains('selected')).toBe(true);

      renderer.deselectTile(element);
      expect(element.classList.contains('selected')).toBe(false);
    });

    test('should support tile highlighting', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      renderer.highlightTile(element);
      expect(element.classList.contains('highlighted')).toBe(true);

      renderer.unhighlightTile(element);
      expect(element.classList.contains('highlighted')).toBe(false);
    });
  });

  describe('Tile Sets and Groups', () => {
    test('should render a pung (three of a kind)', () => {
      const pung = [
        { suit: 'bamboo', value: 3 },
        { suit: 'bamboo', value: 3 },
        { suit: 'bamboo', value: 3 }
      ];

      const group = renderer.renderTileGroup(pung, container, 'pung');
      expect(group.classList.contains('tile-group')).toBe(true);
      expect(group.classList.contains('pung')).toBe(true);
      expect(group.children.length).toBe(3);
    });

    test('should render a chow (sequence)', () => {
      const chow = [
        { suit: 'bamboo', value: 1 },
        { suit: 'bamboo', value: 2 },
        { suit: 'bamboo', value: 3 }
      ];

      const group = renderer.renderTileGroup(chow, container, 'chow');
      expect(group.classList.contains('chow')).toBe(true);
    });

    test('should render a kong (four of a kind)', () => {
      const kong = [
        { suit: 'dot', value: 5 },
        { suit: 'dot', value: 5 },
        { suit: 'dot', value: 5 },
        { suit: 'dot', value: 5 }
      ];

      const group = renderer.renderTileGroup(kong, container, 'kong');
      expect(group.classList.contains('kong')).toBe(true);
      expect(group.children.length).toBe(4);
    });
  });

  describe('Visual States', () => {
    test('should show face-down tiles', () => {
      const element = renderer.renderFaceDownTile(container);
      expect(element.classList.contains('face-down')).toBe(true);
    });

    test('should flip tiles', async () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      await renderer.flipTile(element, false); // Face down
      expect(element.classList.contains('face-down')).toBe(true);

      await renderer.flipTile(element, true); // Face up
      expect(element.classList.contains('face-down')).toBe(false);
    });

    test('should apply disabled state', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      renderer.disableTile(element);
      expect(element.classList.contains('disabled')).toBe(true);
      expect(element.hasAttribute('disabled')).toBe(true);

      renderer.enableTile(element);
      expect(element.classList.contains('disabled')).toBe(false);
      expect(element.hasAttribute('disabled')).toBe(false);
    });

    test('should apply error state', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      renderer.showError(element);
      expect(element.classList.contains('error')).toBe(true);

      renderer.clearError(element);
      expect(element.classList.contains('error')).toBe(false);
    });

    test('should apply success state', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      renderer.showSuccess(element);
      expect(element.classList.contains('success')).toBe(true);

      renderer.clearSuccess(element);
      expect(element.classList.contains('success')).toBe(false);
    });
  });

  describe('Animations', () => {
    test('should animate tile entry', async () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container, {
        animate: true
      });

      expect(element.classList.contains('tile-enter')).toBe(true);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(element.classList.contains('tile-enter-active')).toBe(true);
    });

    test('should animate tile removal', async () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      await renderer.removeTile(element, true); // Animated removal
      expect(container.contains(element)).toBe(false);
    });

    test('should support shuffle animation', async () => {
      const tiles = [
        { suit: 'bamboo', value: 1 },
        { suit: 'bamboo', value: 2 },
        { suit: 'bamboo', value: 3 }
      ];

      const elements = renderer.renderTiles(tiles, container);
      await renderer.shuffleTiles(elements);

      // Check that tiles are still in container but possibly reordered
      expect(container.children.length).toBe(3);
    });
  });

  describe('Responsive Design', () => {
    test('should adjust tile size based on container width', () => {
      // Mock container dimensions
      Object.defineProperty(container, 'offsetWidth', {
        value: 320,
        writable: true
      });

      renderer.updateResponsiveSize(container);
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      expect(element.classList.contains('tile-small')).toBe(true);
    });

    test('should handle window resize', () => {
      const resizeSpy = jest.fn();
      renderer.onResize = resizeSpy;

      window.dispatchEvent(new Event('resize'));
      expect(resizeSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('should add ARIA labels', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      expect(element.getAttribute('role')).toBe('button');
      expect(element.getAttribute('aria-label')).toContain('bamboo');
      expect(element.getAttribute('aria-label')).toContain('1');
    });

    test('should support keyboard navigation', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const clickHandler = jest.fn();

      const element = renderer.renderTile(tile, container, {
        onClick: clickHandler
      });

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      element.dispatchEvent(enterEvent);
      expect(clickHandler).toHaveBeenCalled();

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      element.dispatchEvent(spaceEvent);
      expect(clickHandler).toHaveBeenCalledTimes(2);
    });

    test('should handle focus states', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const element = renderer.renderTile(tile, container);

      element.focus();
      expect(document.activeElement).toBe(element);
      expect(element.classList.contains('focused')).toBe(true);

      element.blur();
      expect(element.classList.contains('focused')).toBe(false);
    });
  });

  describe('Performance', () => {
    test('should render large tile sets efficiently', () => {
      const startTime = performance.now();

      const tiles = Array.from({ length: 144 }, (_, i) => ({
        suit: ['bamboo', 'character', 'dot'][i % 3],
        value: (i % 9) + 1
      }));

      renderer.renderTiles(tiles, container);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
      expect(container.children.length).toBe(144);
    });

    test('should use DocumentFragment for batch rendering', () => {
      const spy = jest.spyOn(document, 'createDocumentFragment');

      const tiles = Array.from({ length: 10 }, (_, i) => ({
        suit: 'bamboo',
        value: (i % 9) + 1
      }));

      renderer.renderTiles(tiles, container);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Memory Management', () => {
    test('should clean up event listeners on destroy', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const clickHandler = jest.fn();

      const element = renderer.renderTile(tile, container, {
        onClick: clickHandler
      });

      renderer.destroy();
      element.click();

      // Handler should not be called after destroy
      expect(clickHandler).not.toHaveBeenCalled();
    });

    test('should clear tile cache on destroy', () => {
      const tiles = [
        { suit: 'bamboo', value: 1 },
        { suit: 'bamboo', value: 2 }
      ];

      renderer.renderTiles(tiles, container);
      renderer.destroy();

      expect(renderer.tileCache).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid tile data gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const invalidTiles = [
        null,
        undefined,
        { suit: 'invalid' },
        { value: 'invalid' },
        {}
      ];

      invalidTiles.forEach(tile => {
        const element = renderer.renderTile(tile, container);
        expect(element).toBeDefined(); // Should return fallback element
      });

      consoleSpy.mockRestore();
    });

    test('should handle missing container gracefully', () => {
      const tile = { suit: 'bamboo', value: 1 };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const element = renderer.renderTile(tile, null);
      expect(element).toBeDefined(); // Should return element even without container

      consoleSpy.mockRestore();
    });
  });
});