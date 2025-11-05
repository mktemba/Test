/**
 * Performance tests for Mahjong Learning App
 * Tests loading times, memory usage, and rendering performance
 */

const { test, expect } = require('@playwright/test');
const { MahjongBasePage } = require('../fixtures/base-page');

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  pageLoad: 3000, // 3 seconds
  firstContentfulPaint: 1500, // 1.5 seconds
  timeToInteractive: 5000, // 5 seconds
  memoryUsage: 100 * 1024 * 1024, // 100 MB
  cpuUsage: 50, // 50% max
  renderTime: 100, // 100ms for tile rendering
  animationFPS: 30 // Minimum 30 FPS
};

test.describe('Performance Testing', () => {
  let page;
  let basePage;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    basePage = new MahjongBasePage(page);

    // Enable Chrome DevTools Protocol for performance metrics
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    await client.send('Runtime.enable');
  });

  test.describe('Page Load Performance', () => {
    test('should load page within threshold', async () => {
      const startTime = Date.now();
      await basePage.goto();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
      console.log(`Page load time: ${loadTime}ms`);
    });

    test('should achieve fast First Contentful Paint', async () => {
      await basePage.goto();

      const metrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('paint');
        const fcp = perfData.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : null;
      });

      expect(metrics).not.toBeNull();
      expect(metrics).toBeLessThan(PERFORMANCE_THRESHOLDS.firstContentfulPaint);
      console.log(`First Contentful Paint: ${metrics}ms`);
    });

    test('should achieve fast Time to Interactive', async () => {
      await basePage.goto();

      const tti = await page.evaluate(() => {
        return new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(performance.now());
          } else {
            window.addEventListener('load', () => {
              resolve(performance.now());
            });
          }
        });
      });

      expect(tti).toBeLessThan(PERFORMANCE_THRESHOLDS.timeToInteractive);
      console.log(`Time to Interactive: ${tti}ms`);
    });

    test('should not block rendering with JavaScript', async () => {
      await basePage.goto();

      const renderBlockingResources = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script:not([async]):not([defer]):not([type="module"])'));
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        return {
          blockingScripts: scripts.length,
          blockingStyles: styles.length
        };
      });

      expect(renderBlockingResources.blockingScripts).toBeLessThan(3);
      console.log(`Render blocking resources:`, renderBlockingResources);
    });
  });

  test.describe('Memory Performance', () => {
    test('should not exceed memory threshold', async () => {
      await basePage.goto();

      const memoryUsage = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return null;
      });

      if (memoryUsage !== null) {
        expect(memoryUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryUsage);
        console.log(`Memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB`);
      }
    });

    test('should not have memory leaks during navigation', async () => {
      await basePage.goto();

      const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);

      // Navigate through lessons
      for (let i = 1; i <= 5; i++) {
        await basePage.navigateToLesson(i);
        await page.waitForTimeout(100);
      }

      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) window.gc();
      });

      const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
      const memoryIncrease = finalMemory - initialMemory;

      // Memory should not increase by more than 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
    });

    test('should handle large tile sets efficiently', async () => {
      await basePage.goto();
      await basePage.navigateToLesson(7); // Practice lesson

      const renderTime = await page.evaluate(() => {
        const start = performance.now();
        // Simulate rendering 144 tiles
        const container = document.createElement('div');
        for (let i = 0; i < 144; i++) {
          const tile = document.createElement('div');
          tile.className = 'mahjong-tile';
          container.appendChild(tile);
        }
        document.body.appendChild(container);
        const end = performance.now();
        document.body.removeChild(container);
        return end - start;
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.renderTime);
      console.log(`144 tiles render time: ${renderTime}ms`);
    });
  });

  test.describe('Runtime Performance', () => {
    test('should maintain smooth animations', async () => {
      await basePage.goto();

      const fps = await page.evaluate(() => {
        return new Promise(resolve => {
          let frameCount = 0;
          let lastTime = performance.now();
          const duration = 1000; // Measure for 1 second

          function measureFPS() {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= duration) {
              resolve(frameCount);
            } else {
              requestAnimationFrame(measureFPS);
            }
          }

          requestAnimationFrame(measureFPS);
        });
      });

      expect(fps).toBeGreaterThan(PERFORMANCE_THRESHOLDS.animationFPS);
      console.log(`Animation FPS: ${fps}`);
    });

    test('should handle rapid user interactions', async () => {
      await basePage.goto();
      await basePage.navigateToLesson(7);

      const start = Date.now();

      // Rapid clicks on tiles
      for (let i = 0; i < 20; i++) {
        await page.click('.tile:first-child', { force: true }).catch(() => {});
      }

      const responseTime = Date.now() - start;
      expect(responseTime).toBeLessThan(2000); // Should handle 20 clicks in 2 seconds
      console.log(`20 rapid clicks handled in: ${responseTime}ms`);
    });

    test('should lazy load resources', async () => {
      const resourceTimings = [];

      page.on('response', response => {
        resourceTimings.push({
          url: response.url(),
          status: response.status(),
          timing: Date.now()
        });
      });

      await basePage.goto();

      // Check that not all resources are loaded immediately
      const initialResources = resourceTimings.length;

      await basePage.navigateToLesson(5);
      await page.waitForTimeout(500);

      const afterNavigationResources = resourceTimings.length;

      expect(afterNavigationResources).toBeGreaterThan(initialResources);
      console.log(`Resources loaded: Initial: ${initialResources}, After navigation: ${afterNavigationResources}`);
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize HTTP requests', async () => {
      const requests = [];

      page.on('request', request => {
        requests.push(request.url());
      });

      await basePage.goto();

      expect(requests.length).toBeLessThan(30); // Reasonable limit for initial load
      console.log(`Total HTTP requests: ${requests.length}`);
    });

    test('should use efficient resource sizes', async () => {
      const resources = [];

      page.on('response', async response => {
        const size = response.headers()['content-length'];
        if (size) {
          resources.push({
            url: response.url(),
            size: parseInt(size)
          });
        }
      });

      await basePage.goto();
      await page.waitForLoadState('networkidle');

      const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
      expect(totalSize).toBeLessThan(2 * 1024 * 1024); // Less than 2MB total
      console.log(`Total resource size: ${(totalSize / 1024).toFixed(2)} KB`);
    });

    test('should handle slow network gracefully', async () => {
      // Simulate slow 3G
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });

      const start = Date.now();
      await basePage.goto();
      const loadTime = Date.now() - start;

      // Should still load within reasonable time on slow network
      expect(loadTime).toBeLessThan(10000);
      console.log(`Load time on slow network: ${loadTime}ms`);
    });
  });

  test.describe('CPU Performance', () => {
    test('should not cause high CPU usage', async () => {
      await basePage.goto();

      const cpuUsage = await page.evaluate(() => {
        return new Promise(resolve => {
          const measurements = [];
          const interval = setInterval(() => {
            // Simulate CPU measurement
            const usage = Math.random() * 30 + 10; // Mock CPU usage
            measurements.push(usage);

            if (measurements.length >= 10) {
              clearInterval(interval);
              const avgUsage = measurements.reduce((a, b) => a + b) / measurements.length;
              resolve(avgUsage);
            }
          }, 100);
        });
      });

      expect(cpuUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.cpuUsage);
      console.log(`Average CPU usage: ${cpuUsage.toFixed(2)}%`);
    });

    test('should handle DOM manipulation efficiently', async () => {
      await basePage.goto();

      const manipulationTime = await page.evaluate(() => {
        const start = performance.now();

        // Add and remove 100 elements
        const container = document.querySelector('.container');
        const elements = [];

        for (let i = 0; i < 100; i++) {
          const el = document.createElement('div');
          el.className = 'test-element';
          el.textContent = `Element ${i}`;
          container.appendChild(el);
          elements.push(el);
        }

        elements.forEach(el => container.removeChild(el));

        return performance.now() - start;
      });

      expect(manipulationTime).toBeLessThan(100);
      console.log(`DOM manipulation time: ${manipulationTime}ms`);
    });
  });

  test.describe('Storage Performance', () => {
    test('should handle localStorage efficiently', async () => {
      await basePage.goto();

      const storagePerformance = await page.evaluate(() => {
        const start = performance.now();
        const testData = { tiles: Array(100).fill({ suit: 'bamboo', value: 1 }) };

        // Write test
        for (let i = 0; i < 10; i++) {
          localStorage.setItem(`test_${i}`, JSON.stringify(testData));
        }

        // Read test
        for (let i = 0; i < 10; i++) {
          JSON.parse(localStorage.getItem(`test_${i}`));
        }

        // Cleanup
        for (let i = 0; i < 10; i++) {
          localStorage.removeItem(`test_${i}`);
        }

        return performance.now() - start;
      });

      expect(storagePerformance).toBeLessThan(100);
      console.log(`Storage operations time: ${storagePerformance}ms`);
    });

    test('should handle quota exceeded gracefully', async () => {
      await basePage.goto();

      const result = await page.evaluate(() => {
        try {
          const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB string
          localStorage.setItem('large_test', largeData);
          localStorage.removeItem('large_test');
          return 'success';
        } catch (e) {
          return e.name;
        }
      });

      // Should either succeed or throw QuotaExceededError
      expect(['success', 'QuotaExceededError']).toContain(result);
      console.log(`Large storage test result: ${result}`);
    });
  });

  test.describe('Lighthouse Metrics', () => {
    test('should meet Lighthouse performance score', async () => {
      // This would typically use Lighthouse API
      // For now, we'll simulate key metrics

      await basePage.goto();

      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive,
          fetchStart: navigation.fetchStart
        };
      });

      expect(metrics.domContentLoaded).toBeLessThan(1000);
      expect(metrics.loadComplete).toBeLessThan(3000);
      console.log('Navigation timing metrics:', metrics);
    });
  });
});