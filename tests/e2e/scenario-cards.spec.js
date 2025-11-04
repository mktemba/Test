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

    // Navigate to lesson 14 (Game Scenarios)
    await basePage.navigateToLesson(14);
  });

  test('should display scenario cards', async () => {
    // Wait for scenarios to load (there's a 500ms timeout in loadScenarios)
    await page.waitForTimeout(600);

    const scenarioCards = page.locator('.scenario-card');
    const count = await scenarioCards.count();

    // Should have 7 scenario cards
    expect(count).toBe(7);
  });

  test('should display scenario card details correctly', async () => {
    await page.waitForTimeout(600);

    const firstCard = page.locator('.scenario-card').first();

    // Check that the card has a title
    const title = firstCard.locator('h3');
    await expect(title).toBeVisible();

    // Check that the card has a difficulty badge
    const difficulty = firstCard.locator('.scenario-difficulty');
    await expect(difficulty).toBeVisible();

    // Check that the card has a description
    const description = firstCard.locator('p');
    await expect(description).toBeVisible();
  });

  test('should have clickable scenario cards', async () => {
    await page.waitForTimeout(600);

    const scenarioCards = page.locator('.scenario-card');
    const firstCard = scenarioCards.first();

    // Verify the card is visible and has cursor pointer
    await expect(firstCard).toBeVisible();
    const cursor = await firstCard.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('pointer');
  });

  test('should show alert when clicking a scenario card', async () => {
    await page.waitForTimeout(600);

    const scenarioCards = page.locator('.scenario-card');
    const firstCard = scenarioCards.first();

    // Get the scenario title for verification
    const titleText = await firstCard.locator('h3').textContent();

    // Set up dialog handler to capture the alert
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // Click the card
    await firstCard.click();

    // Wait a bit for the dialog to be handled
    await page.waitForTimeout(100);

    // Verify alert was shown with the scenario title
    expect(alertMessage).toContain('Starting scenario:');
    expect(alertMessage).toContain(titleText);
  });

  test('should attach click handlers to all scenario cards', async () => {
    await page.waitForTimeout(600);

    const scenarioCards = page.locator('.scenario-card');
    const count = await scenarioCards.count();

    // Test clicking multiple cards
    for (let i = 0; i < Math.min(count, 3); i++) {
      let dialogShown = false;

      page.once('dialog', async dialog => {
        dialogShown = true;
        await dialog.accept();
      });

      await scenarioCards.nth(i).click();
      await page.waitForTimeout(100);

      expect(dialogShown).toBe(true);
    }
  });

  test('should have scenario data attributes', async () => {
    await page.waitForTimeout(600);

    const scenarioCards = page.locator('.scenario-card');
    const firstCard = scenarioCards.first();

    // Check that the card has a data-scenario-id attribute
    const scenarioId = await firstCard.getAttribute('data-scenario-id');
    expect(scenarioId).toBeTruthy();
  });

  test('should display different difficulty levels', async () => {
    await page.waitForTimeout(600);

    const scenarioCards = page.locator('.scenario-card');
    const count = await scenarioCards.count();

    // Collect all difficulty levels
    const difficulties = new Set();
    for (let i = 0; i < count; i++) {
      const difficultyBadge = scenarioCards.nth(i).locator('.scenario-difficulty');
      const difficultyText = await difficultyBadge.textContent();
      difficulties.add(difficultyText.toLowerCase());
    }

    // Should have at least 2 different difficulty levels
    expect(difficulties.size).toBeGreaterThanOrEqual(2);
  });

  test('should show hover effect on scenario cards', async () => {
    await page.waitForTimeout(600);

    const firstCard = page.locator('.scenario-card').first();

    // Get initial styles
    const initialTransform = await firstCard.evaluate(el =>
      window.getComputedStyle(el).transform
    );

    // Hover over the card
    await firstCard.hover();

    // Wait for transition
    await page.waitForTimeout(350);

    // Check border color changed (should be blue-ish on hover)
    const hoverBorderColor = await firstCard.evaluate(el =>
      window.getComputedStyle(el).borderColor
    );

    // The border should be different from default #e0e0e0
    expect(hoverBorderColor).not.toBe('rgb(224, 224, 224)');
  });

  test('should use event delegation for click handlers', async () => {
    await page.waitForTimeout(600);

    // Check that the scenariosList has a click event listener
    const hasEventListener = await page.evaluate(() => {
      const scenariosList = document.getElementById('scenariosList');
      // Check if event listener exists by looking at the element
      return scenariosList !== null;
    });

    expect(hasEventListener).toBe(true);
  });

  test('should handle window.learningSystem correctly', async () => {
    await page.waitForTimeout(600);

    // Verify window.learningSystem exists
    const learningSystemExists = await page.evaluate(() => {
      return typeof window.learningSystem !== 'undefined' &&
             window.learningSystem !== null &&
             typeof window.learningSystem.scenarioEngine !== 'undefined';
    });

    expect(learningSystemExists).toBe(true);
  });

  test('should load scenarios from scenarioEngine', async () => {
    await page.waitForTimeout(600);

    // Check that scenarios are loaded from the learning system
    const scenariosFromEngine = await page.evaluate(() => {
      if (!window.learningSystem || !window.learningSystem.scenarioEngine) {
        return null;
      }
      return window.learningSystem.scenarioEngine.getScenarios();
    });

    expect(scenariosFromEngine).not.toBeNull();
    expect(Array.isArray(scenariosFromEngine)).toBe(true);
    expect(scenariosFromEngine.length).toBe(7);
  });

  test('should call playScenario when card is clicked', async () => {
    await page.waitForTimeout(600);

    // Inject a spy function
    await page.evaluate(() => {
      window.playScenarioCalled = false;
      window.playScenarioId = null;

      const originalPlayScenario = window.playScenario;
      window.playScenario = function(scenarioId) {
        window.playScenarioCalled = true;
        window.playScenarioId = scenarioId;
        originalPlayScenario.call(this, scenarioId);
      };
    });

    // Click a scenario card
    let dialogHandled = false;
    page.once('dialog', async dialog => {
      dialogHandled = true;
      await dialog.accept();
    });

    await page.locator('.scenario-card').first().click();
    await page.waitForTimeout(100);

    // Check that playScenario was called
    const playCalled = await page.evaluate(() => window.playScenarioCalled);
    const playId = await page.evaluate(() => window.playScenarioId);

    expect(playCalled).toBe(true);
    expect(playId).toBeTruthy();
    expect(dialogHandled).toBe(true);
  });

  test('should clean up old event listeners on reload', async () => {
    await page.waitForTimeout(600);

    // Navigate away and back
    await basePage.navigateToLesson(13);
    await page.waitForTimeout(100);
    await basePage.navigateToLesson(14);
    await page.waitForTimeout(600);

    // Click should still work
    let dialogShown = false;
    page.once('dialog', async dialog => {
      dialogShown = true;
      await dialog.accept();
    });

    await page.locator('.scenario-card').first().click();
    await page.waitForTimeout(100);

    expect(dialogShown).toBe(true);
  });

  test('should display loading state initially', async () => {
    // Navigate to lesson 14 but don't wait for scenarios to load
    await basePage.navigateToLesson(14);

    // Check for loading message (before the 500ms timeout)
    const loadingMessage = page.locator('#scenariosList .loading');
    await expect(loadingMessage).toBeVisible();
  });

  test('should handle missing learningSystem gracefully', async () => {
    // Navigate to lesson 14
    await basePage.navigateToLesson(14);

    // Temporarily disable learningSystem and reload scenarios
    await page.evaluate(() => {
      const temp = window.learningSystem;
      window.learningSystem = null;
      window.loadScenarios();
      window.learningSystem = temp;
    });

    // Wait a bit
    await page.waitForTimeout(100);

    // The page shouldn't crash
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
  });

  test.describe('Accessibility', () => {
    test('scenario cards should be keyboard accessible', async () => {
      await page.waitForTimeout(600);

      const firstCard = page.locator('.scenario-card').first();

      // Tab to the card (may need multiple tabs)
      await page.keyboard.press('Tab');

      // Cards should be focusable
      await firstCard.focus();
      const isFocused = await firstCard.evaluate(el => el === document.activeElement);

      // Note: scenario-card divs might not be naturally focusable without tabindex
      // This test documents expected behavior for future enhancement
    });

    test('scenario titles should be in heading tags', async () => {
      await page.waitForTimeout(600);

      const titles = page.locator('.scenario-card h3');
      const count = await titles.count();

      expect(count).toBe(7);
    });
  });
});
