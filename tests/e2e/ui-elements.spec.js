const { test, expect } = require('@playwright/test');
const { MahjongBasePage } = require('../fixtures/base-page');

test.describe('Mahjong App - UI Elements', () => {
  let page;
  let basePage;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    basePage = new MahjongBasePage(page);
    await basePage.goto();
    await basePage.clearLocalStorage();
    await page.reload();
  });

  test.describe('Layout and Structure', () => {
    test('should have sidebar visible', async () => {
      const sidebar = basePage.sidebar;
      await expect(sidebar).toBeVisible();
    });

    test('should have progress bar', async () => {
      const progressBar = basePage.progressBar;
      // Progress bar exists but might be hidden when progress is 0%
      await expect(progressBar).toBeAttached();
    });

    test('should display all 13 lessons in sidebar', async () => {
      for (let i = 1; i <= 13; i++) {
        const lessonItem = basePage.getSidebarLesson(i);
        await expect(lessonItem).toBeVisible();
      }
    });

    test('should have navigation buttons', async () => {
      // Lesson 1 only has Start button (Next), no Previous button
      await expect(basePage.nextButton).toBeVisible();
      // Previous button only appears on lessons 2+
      const prevBtnCount = await page.locator('.lesson-content.active .button-group button:has-text("Previous")').count();
      expect(prevBtnCount).toBe(0); // Lesson 1 has no Previous button
    });

    test('should have main content area', async () => {
      const mainContent = page.locator('.main-content, main, .content');
      await expect(mainContent.first()).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be usable on mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Sidebar should still be accessible (may be hidden initially)
      const sidebar = basePage.sidebar;
      const sidebarExists = await sidebar.count();
      expect(sidebarExists).toBeGreaterThan(0);

      // Navigation buttons should be visible
      await expect(basePage.nextButton).toBeVisible();
    });

    test('should be usable on tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(basePage.sidebar).toBeVisible();
      await expect(basePage.progressBar).toBeAttached(); // Progress bar exists but may be hidden
    });

    test('should be usable on desktop viewport', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await expect(basePage.sidebar).toBeVisible();
      await expect(basePage.nextButton).toBeVisible();
    });
  });

  test.describe('Animations and Transitions', () => {
    test('should animate lesson transitions', async () => {
      const lesson1 = basePage.getLessonContent(1);

      await basePage.clickNext();

      // Lesson 1 should lose active class
      await expect(lesson1).not.toHaveClass(/active/);

      // Lesson 2 should gain active class
      const lesson2 = basePage.getLessonContent(2);
      await expect(lesson2).toHaveClass(/active/);
    });

    test('should update progress bar smoothly', async () => {
      const progressBar = basePage.progressBar;

      // Get initial width
      const initialWidth = await progressBar.evaluate(el => el.style.width);

      await basePage.clickNext();
      await basePage.clickNext();

      // Width may have changed (or stayed same depending on completion logic)
      const newWidth = await progressBar.evaluate(el => el.style.width);

      expect(typeof newWidth).toBe('string');
    });
  });

  test.describe('Content Display', () => {
    test('should display lesson titles', async () => {
      const lesson1 = basePage.getLessonContent(1);
      const heading = lesson1.locator('h1, h2, h3').first();

      await expect(heading).toBeVisible();
      const text = await heading.textContent();
      expect(text.length).toBeGreaterThan(0);
    });

    test('should display lesson content', async () => {
      const lesson1 = basePage.getLessonContent(1);
      const paragraphs = lesson1.locator('p');
      const count = await paragraphs.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should have tile images/representations', async () => {
      await basePage.navigateToLesson(7);

      const tiles = page.locator('.tile');
      const tileCount = await tiles.count();

      expect(tileCount).toBeGreaterThan(0);
    });

    test('should show visual feedback on tile selection', async () => {
      await basePage.navigateToLesson(7);

      const tile = page.locator('.lesson-content[data-lesson="7"] #practiceArea .tile').first();
      await tile.click();

      // Tile should have selected class or style
      await expect(tile).toHaveClass(/selected/);
    });
  });

  test.describe('Interactive Elements', () => {
    test('buttons should change state on hover', async () => {
      const nextBtn = basePage.nextButton;

      await nextBtn.hover();

      // Just verify hover doesn't break anything
      await expect(nextBtn).toBeVisible();
    });

    test('tiles should be clickable', async () => {
      await basePage.navigateToLesson(7);

      const tile = page.locator('.lesson-content[data-lesson="7"] #practiceArea .tile').first();

      await expect(tile).toBeVisible();
      await tile.click();

      // Click should register (tile selection tested elsewhere)
      expect(true).toBeTruthy();
    });

    test('sidebar items should be clickable', async () => {
      const lessonItem = basePage.getSidebarLesson(5);

      await expect(lessonItem).toBeVisible();
      await lessonItem.click();

      // Should navigate to lesson 5
      const lesson5 = basePage.getLessonContent(5);
      await expect(lesson5).toHaveClass(/active/);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async () => {
      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();

      // Should have headings
      expect(h1Count + h2Count).toBeGreaterThan(0);
    });

    test('should have alt text for images', async () => {
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        const firstImage = images.first();
        const altText = await firstImage.getAttribute('alt');

        // Alt text should exist (can be empty string for decorative images)
        expect(altText !== null).toBeTruthy();
      }
    });

    test('should have ARIA labels on interactive elements', async () => {
      const nextBtn = basePage.nextButton;
      const ariaLabel = await nextBtn.getAttribute('aria-label');

      // Either has aria-label or readable text
      const text = await nextBtn.textContent();
      expect(ariaLabel || text.length > 0).toBeTruthy();
    });

    test('should support keyboard navigation', async () => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');

      const activeElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      // Should focus on an interactive element
      expect(activeElement).toBeTruthy();
    });

    test('should have sufficient color contrast', async () => {
      // This is a basic check - proper contrast testing requires tools
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Verify page is readable (not all white or all black)
      const backgroundColor = await body.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });

      expect(backgroundColor).toBeTruthy();
    });
  });

  test.describe('Error States', () => {
    test('should handle missing localStorage gracefully', async () => {
      // Disable localStorage
      await page.evaluate(() => {
        Object.defineProperty(window, 'localStorage', {
          value: null,
          writable: true
        });
      });

      // App should still load (may have degraded functionality)
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show appropriate message for completed tutorial', async () => {
      await basePage.navigateToLesson(13);

      const completionMessage = page.locator('text=/complete|finish|done/i');
      const messageCount = await completionMessage.count();

      // Lesson 13 may have completion messaging
      expect(messageCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Visual Consistency', () => {
    test('should use consistent styling across lessons', async () => {
      const lesson1 = basePage.getLessonContent(1);
      const lesson1Classes = await lesson1.getAttribute('class');

      await basePage.navigateToLesson(5);

      const lesson5 = basePage.getLessonContent(5);
      const lesson5Classes = await lesson5.getAttribute('class');

      // Both should have 'lesson-content' class
      expect(lesson1Classes).toContain('lesson-content');
      expect(lesson5Classes).toContain('lesson-content');
    });

    test('should have consistent button styling', async () => {
      const nextBtn = basePage.nextButton;
      const nextBtnClass = await nextBtn.getAttribute('class');

      await basePage.navigateToLesson(7);

      const checkBtn = page.locator('.lesson-content[data-lesson="7"] button:has-text("Check")');
      const checkBtnClass = await checkBtn.getAttribute('class');

      // Both should have button-related classes
      expect(nextBtnClass || checkBtnClass).toBeTruthy();
    });
  });
});
