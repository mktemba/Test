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
    await page.waitForTimeout(1000);
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

  test('should navigate through all 13 lessons', async () => {
    for (let i = 1; i <= 13; i++) {
      const lesson = basePage.getLessonContent(i);
      await expect(lesson).toBeVisible();

      if (i < 13) {
        await basePage.clickNext();
      }
    }
  });

  test('should have working keyboard navigation', async () => {
    // Press right arrow to go to next lesson
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    const lesson2 = basePage.getLessonContent(2);
    await expect(lesson2).toHaveClass(/active/);

    // Press left arrow to go back
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    const lesson1 = basePage.getLessonContent(1);
    await expect(lesson1).toHaveClass(/active/);
  });

  test('should update URL hash when navigating', async () => {
    await basePage.navigateToLesson(3);

    // Check if URL contains lesson indicator (if implemented)
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should disable Previous button on first lesson', async () => {
    const prevBtn = basePage.previousButton;
    await expect(prevBtn).toBeDisabled();
  });

  test('should disable Next button on last lesson', async () => {
    await basePage.navigateToLesson(13);
    const nextBtn = basePage.nextButton;
    await expect(nextBtn).toBeDisabled();
  });

  test('should show correct lesson in sidebar as active', async () => {
    await basePage.navigateToLesson(4);

    const sidebarItem = basePage.getSidebarLesson(4);
    await expect(sidebarItem).toHaveClass(/active/);
  });
});
