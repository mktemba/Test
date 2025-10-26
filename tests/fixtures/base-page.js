/**
 * Base page object for the Mahjong Learning App
 * Contains common selectors and helper methods
 */
class MahjongBasePage {
  constructor(page) {
    this.page = page;
  }

  // Navigation elements
  get nextButton() {
    return this.page.locator('button:has-text("Next")');
  }

  get previousButton() {
    return this.page.locator('button:has-text("Previous")');
  }

  // Progress elements
  get progressBar() {
    return this.page.locator('#progressFill');
  }

  get progressText() {
    return this.page.locator('.progress-text');
  }

  // Sidebar elements
  get sidebar() {
    return this.page.locator('.sidebar');
  }

  getSidebarLesson(lessonNumber) {
    return this.page.locator(`.lesson-item[data-lesson="${lessonNumber}"]`);
  }

  // Lesson content
  get activeLesson() {
    return this.page.locator('.lesson-content.active');
  }

  getLessonContent(lessonNumber) {
    return this.page.locator(`#lesson${lessonNumber}`);
  }

  // Practice exercises
  get pairsPractice() {
    return this.page.locator('#pairsPractice');
  }

  get pungsPractice() {
    return this.page.locator('#pungsPractice');
  }

  get chowsPractice() {
    return this.page.locator('#chowsPractice');
  }

  get winningHandPractice() {
    return this.page.locator('#winningHandPractice');
  }

  // Helper methods
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToLesson(lessonNumber) {
    const sidebarItem = this.getSidebarLesson(lessonNumber);
    await sidebarItem.click();
    await this.page.waitForTimeout(300); // Wait for transition
  }

  async clickNext() {
    await this.nextButton.click();
    await this.page.waitForTimeout(300);
  }

  async clickPrevious() {
    await this.previousButton.click();
    await this.page.waitForTimeout(300);
  }

  async getProgressPercentage() {
    const width = await this.progressBar.evaluate(el => el.style.width);
    return parseFloat(width);
  }

  async isLessonCompleted(lessonNumber) {
    const sidebarItem = this.getSidebarLesson(lessonNumber);
    const text = await sidebarItem.textContent();
    return text.includes('✓');
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mahjong_')) {
          localStorage.removeItem(key);
        }
      }
    });
  }

  async getLocalStorageItem(key) {
    return await this.page.evaluate((k) => {
      return localStorage.getItem('mahjong_' + k);
    }, key);
  }

  async setLocalStorageItem(key, value) {
    await this.page.evaluate(({ k, v }) => {
      localStorage.setItem('mahjong_' + k, v);
    }, { k: key, v: value });
  }
}

module.exports = { MahjongBasePage };
