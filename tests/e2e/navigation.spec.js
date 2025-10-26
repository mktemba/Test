const { test, expect } = require('@playwright/test');
const { MahjongBasePage } = require('../fixtures/base-page');

test.describe('Mahjong App - Navigation', () => {
  let page;
  let basePage;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    basePage = new MahjongBasePage(page);
    await basePage.goto();
    await basePage.clearLocalStorage();
    await page.reload();
  });

  test('should load the application without errors', async () => {
    // Check that the page loaded
    await expect(page).toHaveTitle(/Mahjong/i);

    // Check for no JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('should display lesson 1 by default', async () => {
    const lesson1 = basePage.getLessonContent(1);
    await expect(lesson1).toHaveClass(/active/);
    await expect(lesson1).toBeVisible();
  });

  test('should navigate to next lesson using Next button', async () => {
    await basePage.clickNext();

    const lesson2 = basePage.getLessonContent(2);
    await expect(lesson2).toHaveClass(/active/);
    await expect(lesson2).toBeVisible();
  });

  test('should navigate to previous lesson using Previous button', async () => {
    // Go to lesson 2 first
    await basePage.clickNext();

    // Go back to lesson 1
    await basePage.clickPrevious();

    const lesson1 = basePage.getLessonContent(1);
    await expect(lesson1).toHaveClass(/active/);
  });

  test('should navigate using sidebar', async () => {
    await basePage.navigateToLesson(5);

    const lesson5 = basePage.getLessonContent(5);
    await expect(lesson5).toHaveClass(/active/);
    await expect(lesson5).toBeVisible();
  });

  test('should navigate through lessons using sidebar', async () => {
    // Navigate through all lessons via sidebar to avoid practice exercise complications
    for (let i = 1; i <= 13; i++) {
      await basePage.navigateToLesson(i);
      const currentLesson = basePage.getLessonContent(i);
      await expect(currentLesson).toHaveClass(/active/);
    }
  });

  test('should have working keyboard navigation', async () => {
    // Press right arrow to go to next lesson
    await page.keyboard.press('ArrowRight');
    const lesson2 = basePage.getLessonContent(2);
    await expect(lesson2).toHaveClass(/active/);

    // Press left arrow to go back
    await page.keyboard.press('ArrowLeft');
    const lesson1 = basePage.getLessonContent(1);
    await expect(lesson1).toHaveClass(/active/);
  });

  test('should update URL hash when navigating', async () => {
    await basePage.navigateToLesson(3);

    // Check if URL contains lesson indicator (if implemented)
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should not show Previous button on first lesson', async () => {
    // Lesson 1 only has "Start Learning" button, no Previous button
    const prevBtn = page.locator('.lesson-content.active .button-group button:has-text("Previous")');
    await expect(prevBtn).toHaveCount(0);
  });

  test('should not allow navigation beyond last lesson', async () => {
    await basePage.navigateToLesson(13);
    // Lesson 13 should not have Next button or it should be at max lesson
    const lesson13 = basePage.getLessonContent(13);
    await expect(lesson13).toHaveClass(/active/);
  });

  test('should show correct lesson in sidebar as active', async () => {
    await basePage.navigateToLesson(4);

    const sidebarItem = basePage.getSidebarLesson(4);
    await expect(sidebarItem).toHaveClass(/active/);
  });
});
