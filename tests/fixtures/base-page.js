/**
 * Base page object for the Mahjong Learning App
 * Contains common selectors and helper methods
 */
class MahjongBasePage {
  constructor(page) {
    this.page = page;
  }

  // Navigation elements - use visible button in active lesson
  get nextButton() {
    // Find the Next button (not Check or other buttons)
    return this.page.locator('.lesson-content.active .button-group button.btn-primary:has-text("Next"), .lesson-content.active .button-group button.btn-primary:has-text("Start")').first();
  }

  get previousButton() {
    return this.page.locator('.lesson-content.active .button-group button.btn-secondary').first();
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
    return this.page.locator(`.lesson-content[data-lesson="${lessonNumber}"]`);
  }

  // Practice exercises
  get pairsPractice() {
    return this.page.locator('.lesson-content[data-lesson="7"] #practiceArea');
  }

  get pungsPractice() {
    return this.page.locator('.lesson-content[data-lesson="8"] #pungPracticeArea');
  }

  get chowsPractice() {
    return this.page.locator('.lesson-content[data-lesson="9"] #chowPracticeArea');
  }

  get winningHandPractice() {
    return this.page.locator('.lesson-content[data-lesson="12"] #currentHand');
  }

  // Scenario elements (Lesson 14)
  get scenariosList() {
    return this.page.locator('#scenariosList');
  }

  get scenarioCards() {
    return this.page.locator('.scenario-card');
  }

  getScenarioCard(index = 0) {
    return this.scenarioCards.nth(index);
  }

  // Helper methods
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToLesson(lessonNumber) {
    const sidebarItem = this.getSidebarLesson(lessonNumber);
    await sidebarItem.click();
    // Wait for lesson transition animations (~300ms for CSS transitions)
    // This is a bounded wait for visual transitions, not a test synchronization mechanism
    await this.page.waitForTimeout(300);

    // For practice lessons (7, 8, 9, 12), wait for tiles to be rendered
    const practiceLessons = [7, 8, 9, 12];
    if (practiceLessons.includes(lessonNumber)) {
      // Wait for at least one tile to appear (up to 5 seconds)
      await this.page.waitForSelector('.lesson-content.active .tile', { timeout: 5000 }).catch(() => {
        console.warn(`[Warning] No tiles appeared for lesson ${lessonNumber} within 5 seconds`);
      });
    }

    // For scenarios lesson (14), wait for scenarios to load
    if (lessonNumber === 14) {
      // Wait for scenarios to load (up to 10 seconds)
      await this.page.waitForSelector('.scenario-card', { timeout: 10000 }).catch(() => {
        console.warn(`[Warning] No scenarios appeared for lesson 14 within 10 seconds`);
      });
    }
  }

  async clickNext() {
    await this.nextButton.click();
    // Wait for lesson transition animations (~300ms for CSS transitions)
    // This is a bounded wait for visual transitions, not a test synchronization mechanism
    await this.page.waitForTimeout(300);
  }

  async clickPrevious() {
    await this.previousButton.click();
    // Wait for lesson transition animations (~300ms for CSS transitions)
    // This is a bounded wait for visual transitions, not a test synchronization mechanism
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
