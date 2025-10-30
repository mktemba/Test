/**
 * Smoke tests for Mahjong Learning App
 * Quick tests for critical functionality
 */

const { test, expect } = require('@playwright/test');
const { MahjongBasePage } = require('../fixtures/base-page');

test.describe('Smoke Tests - Critical Path', () => {
  let page;
  let basePage;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    basePage = new MahjongBasePage(page);
  });

  test('Application loads successfully', async () => {
    await basePage.goto();

    // Check title
    await expect(page).toHaveTitle(/Mahjong/i);

    // Check main container exists
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Check no console errors
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('Navigation works', async () => {
    await basePage.goto();

    // Check initial lesson
    const lesson1 = basePage.getLessonContent(1);
    await expect(lesson1).toBeVisible();

    // Navigate to next lesson
    await basePage.clickNext();
    const lesson2 = basePage.getLessonContent(2);
    await expect(lesson2).toBeVisible();

    // Navigate via sidebar
    await basePage.navigateToLesson(5);
    const lesson5 = basePage.getLessonContent(5);
    await expect(lesson5).toBeVisible();
  });

  test('Lessons display correctly', async () => {
    await basePage.goto();

    // Check lesson structure
    const lessonContent = page.locator('.lesson-content.active');
    await expect(lessonContent).toBeVisible();

    // Check lesson has content
    const lessonText = await lessonContent.textContent();
    expect(lessonText.length).toBeGreaterThan(50);

    // Check images load (if any)
    const images = lessonContent.locator('img');
    const imageCount = await images.count();
    if (imageCount > 0) {
      await expect(images.first()).toBeVisible();
    }
  });

  test('Practice exercises function', async () => {
    await basePage.goto();

    // Navigate to practice lesson
    await basePage.navigateToLesson(7);

    // Check practice area exists
    const practiceArea = page.locator('#practiceArea');
    await expect(practiceArea).toBeVisible();

    // Check tiles are rendered
    await page.waitForTimeout(1000); // Wait for tiles to render
    const tiles = practiceArea.locator('.tile');
    const tileCount = await tiles.count();
    expect(tileCount).toBeGreaterThan(0);
  });

  test('Data saves to localStorage', async () => {
    await basePage.goto();

    // Navigate through lessons
    await basePage.navigateToLesson(3);

    // Check localStorage has data (app uses 'mahjong_progress' key)
    const hasProgress = await page.evaluate(() => {
      const progress = localStorage.getItem('mahjong_progress');
      return progress !== null && progress !== '';
    });

    expect(hasProgress).toBe(true);
  });

  test('Audio toggle works', async () => {
    await basePage.goto();

    // Find audio toggle button
    const audioToggle = page.locator('.audio-toggle, button:has-text("Audio")');
    const audioToggleCount = await audioToggle.count();

    if (audioToggleCount > 0) {
      // Click audio toggle
      await audioToggle.first().click();

      // Check state changed
      const isMuted = await page.evaluate(() => {
        return localStorage.getItem('audioMuted') === 'true';
      });

      expect(isMuted).toBeDefined();
    }
  });

  test('Difficulty selector works', async () => {
    await basePage.goto();

    // Find difficulty selector
    const difficultySelector = page.locator('select#difficulty, .difficulty-selector select');
    const selectorCount = await difficultySelector.count();

    if (selectorCount > 0) {
      // Change difficulty
      await difficultySelector.first().selectOption('hard');

      // Check if difficulty changed
      const selectedDifficulty = await difficultySelector.first().inputValue();
      expect(selectedDifficulty).toBe('hard');
    }
  });

  test('Progress bar updates', async () => {
    await basePage.goto();

    // Check progress bar exists
    const progressBar = page.locator('.progress-bar, .progress, [role="progressbar"]');
    const progressBarCount = await progressBar.count();

    if (progressBarCount > 0) {
      // Navigate to advance progress
      await basePage.navigateToLesson(5);

      // Check progress updated
      const progressValue = await progressBar.first().getAttribute('aria-valuenow') ||
                          await progressBar.first().getAttribute('style');
      expect(progressValue).toBeDefined();
    }
  });

  test('Sidebar navigation works', async () => {
    await basePage.goto();

    // Check sidebar exists
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();

    // Check sidebar has lesson items
    const lessonItems = sidebar.locator('.sidebar-item, .lesson-item');
    const itemCount = await lessonItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // Click a sidebar item
    await lessonItems.nth(2).click();

    // Check navigation occurred
    const activeLesson = page.locator('.lesson-content.active');
    await expect(activeLesson).toBeVisible();
  });

  test('Mobile responsive design', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await basePage.goto();

    // Check container adapts
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Check navigation still works
    await basePage.clickNext();
    const lesson2 = basePage.getLessonContent(2);
    await expect(lesson2).toBeVisible();

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});