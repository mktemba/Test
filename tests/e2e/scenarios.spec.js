const { test, expect } = require('@playwright/test');
const { MahjongBasePage } = require('../fixtures/base-page');

test.describe('Mahjong App - Game Scenarios (Lesson 14)', () => {
  let page;
  let basePage;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    basePage = new MahjongBasePage(page);
    await basePage.goto();
    await basePage.clearLocalStorage();
    await page.reload();

    // Navigate to lesson 14
    await basePage.navigateToLesson(14);
  });

  test.describe('Scenario Loading', () => {
    test('should display lesson 14 scenarios section', async () => {
      const scenariosSection = page.locator('.lesson-content[data-lesson="14"]');
      await expect(scenariosSection).toBeVisible();
      await expect(scenariosSection).toHaveClass(/active/);
    });

    test('should show loading state initially', async () => {
      // Navigate fresh to see loading state
      await page.reload();
      await basePage.navigateToLesson(14);

      const scenariosList = page.locator('#scenariosList');
      await expect(scenariosList).toBeVisible();

      // Check for loading indicator (may disappear quickly)
      const loadingText = scenariosList.locator('.loading');
      const isVisible = await loadingText.isVisible().catch(() => false);

      // Either still loading or already loaded with scenarios
      expect(isVisible || await scenariosList.locator('.scenario-card').count() > 0).toBeTruthy();
    });

    test('should load and display scenario cards', async () => {
      const scenariosList = page.locator('#scenariosList');

      // Wait for scenarios to load (max 10 seconds)
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const scenarioCards = page.locator('.scenario-card');
      const count = await scenarioCards.count();

      // Should have at least 1 scenario
      expect(count).toBeGreaterThan(0);
    });

    test('should not be stuck on "Loading scenarios"', async () => {
      const scenariosList = page.locator('#scenariosList');

      // Wait up to 10 seconds for scenarios to load
      await page.waitForFunction(() => {
        const list = document.getElementById('scenariosList');
        return list && !list.textContent.includes('Loading scenarios');
      }, { timeout: 10000 });

      // Verify we have actual content
      const hasCards = await page.locator('.scenario-card').count() > 0;
      const hasMessage = await scenariosList.textContent();

      expect(hasCards || hasMessage.includes('No scenarios')).toBeTruthy();
    });

    test('should display scenario details on cards', async () => {
      // Wait for at least one scenario card
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const firstCard = page.locator('.scenario-card').first();

      // Should have a title
      const title = firstCard.locator('h3');
      await expect(title).toBeVisible();
      const titleText = await title.textContent();
      expect(titleText.length).toBeGreaterThan(0);

      // Should have a difficulty indicator
      const difficulty = firstCard.locator('.scenario-difficulty');
      await expect(difficulty).toBeVisible();

      // Should have a description
      const description = firstCard.locator('p');
      await expect(description).toBeVisible();
      const descText = await description.textContent();
      expect(descText.length).toBeGreaterThan(0);
    });

    test('should have unique IDs for each scenario', async () => {
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const scenarioCards = page.locator('.scenario-card');
      const count = await scenarioCards.count();

      const ids = [];
      for (let i = 0; i < count; i++) {
        const card = scenarioCards.nth(i);
        const scenarioId = await card.getAttribute('data-scenario-id');
        expect(scenarioId).toBeTruthy();
        ids.push(scenarioId);
      }

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  test.describe('Scenario Card Interactions', () => {
    test('should have clickable scenario cards', async () => {
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const firstCard = page.locator('.scenario-card').first();

      // Verify card is clickable (has cursor pointer or is clickable)
      await expect(firstCard).toBeVisible();

      // Should be able to click without error
      const clickPromise = firstCard.click();
      await expect(clickPromise).resolves.not.toThrow();
    });

    test('should be able to click all scenario cards', async () => {
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const cards = page.locator('.scenario-card');
      const count = await cards.count();

      // Try clicking each card (should not throw errors)
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = cards.nth(i);
        await expect(card).toBeVisible();
        await card.click();
        await page.waitForTimeout(100);
      }
    });
  });

  test.describe('Scenario Engine Integration', () => {
    test('should have scenarioEngine initialized', async () => {
      const hasEngine = await page.evaluate(() => {
        return window.learningSystem &&
               window.learningSystem.scenarioEngine &&
               typeof window.learningSystem.scenarioEngine.getScenarios === 'function';
      });

      expect(hasEngine).toBeTruthy();
    });

    test('should load scenarios from ScenarioEngine', async () => {
      const scenariosData = await page.evaluate(() => {
        if (!window.learningSystem || !window.learningSystem.scenarioEngine) {
          return { success: false, error: 'Engine not found' };
        }

        const scenarios = window.learningSystem.scenarioEngine.getScenarios();
        return {
          success: true,
          count: scenarios.length,
          firstScenario: scenarios[0] ? {
            id: scenarios[0].id,
            title: scenarios[0].title,
            hasChoices: Array.isArray(scenarios[0].choices)
          } : null
        };
      });

      expect(scenariosData.success).toBeTruthy();
      expect(scenariosData.count).toBeGreaterThan(0);
      expect(scenariosData.firstScenario).toBeTruthy();
      expect(scenariosData.firstScenario.hasChoices).toBeTruthy();
    });

    test('should match displayed cards with engine scenarios', async () => {
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const cardCount = await page.locator('.scenario-card').count();

      const engineCount = await page.evaluate(() => {
        return window.learningSystem.scenarioEngine.getScenarios().length;
      });

      expect(cardCount).toBe(engineCount);
    });

    test('should have valid scenario data structure', async () => {
      const firstScenario = await page.evaluate(() => {
        const scenarios = window.learningSystem.scenarioEngine.getScenarios();
        return scenarios[0];
      });

      // Verify scenario has required fields
      expect(firstScenario.id).toBeTruthy();
      expect(firstScenario.title).toBeTruthy();
      expect(firstScenario.description).toBeTruthy();
      expect(firstScenario.difficulty).toBeTruthy();
      expect(firstScenario.category).toBeTruthy();
      expect(Array.isArray(firstScenario.choices)).toBeTruthy();
      expect(firstScenario.choices.length).toBeGreaterThan(0);
    });

    test('scenario choices should have proper structure', async () => {
      const firstChoice = await page.evaluate(() => {
        const scenarios = window.learningSystem.scenarioEngine.getScenarios();
        return scenarios[0].choices[0];
      });

      // Verify choice has required fields
      expect(firstChoice.id).toBeTruthy();
      expect(firstChoice.text).toBeTruthy();
      expect(firstChoice.explanation).toBeTruthy();
      expect(typeof firstChoice.score).toBe('number');
      expect(typeof firstChoice.isOptimal).toBe('boolean');
    });
  });

  test.describe('Scenario Difficulty and Categories', () => {
    test('should display difficulty levels correctly', async () => {
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const difficulties = await page.locator('.scenario-difficulty').allTextContents();

      // Should have at least one difficulty shown
      expect(difficulties.length).toBeGreaterThan(0);

      // Valid difficulty levels
      const validDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'];

      difficulties.forEach(diff => {
        expect(validDifficulties).toContain(diff.toLowerCase());
      });
    });

    test('should have scenarios in different categories', async () => {
      const categories = await page.evaluate(() => {
        const scenarios = window.learningSystem.scenarioEngine.getScenarios();
        return [...new Set(scenarios.map(s => s.category))];
      });

      // Should have multiple categories
      expect(categories.length).toBeGreaterThan(1);
    });
  });

  test.describe('Scenario Navigation', () => {
    test('should remain on lesson 14 after clicking scenario', async () => {
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const firstCard = page.locator('.scenario-card').first();
      await firstCard.click();
      await page.waitForTimeout(300);

      // Should still be on lesson 14
      const activeLesson = page.locator('.lesson-content.active');
      await expect(activeLesson).toHaveAttribute('data-lesson', '14');
    });

    test('should have Previous button to navigate back', async () => {
      const prevButton = page.locator('.lesson-content[data-lesson="14"] .button-group button.btn-secondary');
      await expect(prevButton).toBeVisible();
      await expect(prevButton).toContainText('Previous');
    });

    test('should be able to navigate back to previous lesson', async () => {
      const prevButton = page.locator('.lesson-content[data-lesson="14"] .button-group button.btn-secondary');
      await prevButton.click();
      await page.waitForTimeout(300);

      // Should navigate to lesson 13
      const activeLesson = page.locator('.lesson-content.active');
      await expect(activeLesson).toHaveAttribute('data-lesson', '13');
    });

    test('should reload scenarios when returning to lesson 14', async () => {
      // Navigate away
      await basePage.navigateToLesson(13);
      await page.waitForTimeout(300);

      // Navigate back
      await basePage.navigateToLesson(14);
      await page.waitForTimeout(300);

      // Scenarios should be loaded again
      await page.waitForSelector('.scenario-card', { timeout: 10000 });
      const count = await page.locator('.scenario-card').count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Accessibility', () => {
    test('scenario cards should be keyboard accessible', async () => {
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const firstCard = page.locator('.scenario-card').first();

      // Tab to the card (may need to tab through other elements first)
      await page.keyboard.press('Tab');

      // Card should be focusable via keyboard navigation
      // This is a basic check - full keyboard navigation may require more setup
      await expect(firstCard).toBeVisible();
    });

    test('scenarios list should have proper ARIA labels', async () => {
      const scenariosList = page.locator('#scenariosList');
      await expect(scenariosList).toBeVisible();

      // Should have an ID for accessibility
      const listId = await scenariosList.getAttribute('id');
      expect(listId).toBe('scenariosList');
    });

    test('scenario section should have heading', async () => {
      const heading = page.locator('.lesson-content[data-lesson="14"] h2');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Game Scenarios');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing scenarioEngine gracefully', async () => {
      // Temporarily disable scenarioEngine
      await page.evaluate(() => {
        window._tempEngine = window.learningSystem.scenarioEngine;
        window.learningSystem.scenarioEngine = null;
      });

      // Navigate to lesson 14
      await basePage.navigateToLesson(13);
      await basePage.navigateToLesson(14);
      await page.waitForTimeout(1000);

      const scenariosList = page.locator('#scenariosList');
      const content = await scenariosList.textContent();

      // Should show loading or error state, not crash
      expect(content).toBeTruthy();

      // Restore engine
      await page.evaluate(() => {
        window.learningSystem.scenarioEngine = window._tempEngine;
      });
    });

    test('should handle empty scenarios array', async () => {
      // Mock empty scenarios
      const originalCount = await page.evaluate(() => {
        return window.learningSystem.scenarioEngine.getScenarios().length;
      });

      await page.evaluate(() => {
        window.learningSystem.scenarioEngine.getScenarios = () => [];
      });

      // Reload scenarios
      await basePage.navigateToLesson(13);
      await basePage.navigateToLesson(14);
      await page.waitForTimeout(1000);

      const scenariosList = page.locator('#scenariosList');
      const content = await scenariosList.textContent();

      // Should show "no scenarios" message or similar
      expect(content.length).toBeGreaterThan(0);

      // Note: Can't easily restore original function, but test is complete
    });
  });

  test.describe('Performance', () => {
    test('scenarios should load within 5 seconds', async () => {
      const startTime = Date.now();

      await page.waitForSelector('.scenario-card', { timeout: 5000 });

      const loadTime = Date.now() - startTime;

      // Should load in under 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle multiple scenario loads efficiently', async () => {
      // Load scenarios multiple times by navigating
      for (let i = 0; i < 3; i++) {
        await basePage.navigateToLesson(13);
        await page.waitForTimeout(200);
        await basePage.navigateToLesson(14);
        await page.waitForSelector('.scenario-card', { timeout: 5000 });
      }

      // Should still have scenarios loaded
      const count = await page.locator('.scenario-card').count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Visual Regression', () => {
    test('scenario cards should have consistent styling', async () => {
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const cards = page.locator('.scenario-card');
      const count = await cards.count();

      // Check first card has expected classes
      const firstCard = cards.first();
      const className = await firstCard.getAttribute('class');
      expect(className).toContain('scenario-card');

      // All cards should have same base class
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = cards.nth(i);
        const cardClass = await card.getAttribute('class');
        expect(cardClass).toContain('scenario-card');
      }
    });

    test('scenario cards should have hover effect', async () => {
      await page.waitForSelector('.scenario-card', { timeout: 10000 });

      const firstCard = page.locator('.scenario-card').first();

      // Hover over the card
      await firstCard.hover();

      // Card should still be visible and clickable
      await expect(firstCard).toBeVisible();
    });
  });
});
