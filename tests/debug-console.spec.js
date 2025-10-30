const { test, expect } = require('@playwright/test');
const { MahjongBasePage } = require('./tests/fixtures/base-page');

test('debug lesson 7 tiles', async ({ page }) => {
  const messages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    messages.push(type + ': ' + text);
  });

  const basePage = new MahjongBasePage(page);
  await basePage.goto();
  await basePage.clearLocalStorage();
  await page.reload();

  await basePage.navigateToLesson(7);

  await page.waitForTimeout(3000);

  console.log('\n=== Browser Console Messages ===');
  messages.forEach(msg => console.log(msg));

  const tileCount = await page.locator('.lesson-content[data-lesson="7"] #practiceArea .tile').count();
  console.log('\nTile count: ' + tileCount);

  const hasRenderer = await page.evaluate(() => {
    return {
      hasWindow: typeof window !== 'undefined',
      hasTileRenderer: typeof window.tileRenderer !== 'undefined',
      hasWaitFn: typeof window.waitForTileRenderer !== 'undefined',
      hasInitPractice: typeof initPractice !== 'undefined'
    };
  });
  console.log('Global checks:', JSON.stringify(hasRenderer));
});
