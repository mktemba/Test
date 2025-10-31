const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console messages
  page.on('console', msg => console.log(`CONSOLE [${msg.type()}]:`, msg.text()));
  page.on('pageerror', err => console.log(`PAGE ERROR:`, err.message));

  console.log('Navigating to app...');
  await page.goto('http://localhost:8080/learn-mahjong.html');

  console.log('Waiting for page to load...');
  await page.waitForLoadState('networkidle');

  console.log('Clicking lesson 14 (scenarios)...');
  await page.click('[data-lesson="14"]');

  await page.waitForTimeout(3000);

  // Check if scenarios loaded
  const scenariosHTML = await page.locator('#scenariosList').innerHTML();
  console.log('Scenarios list HTML:', scenariosHTML.substring(0, 300));

  const scenarioCount = await page.locator('.scenario-card').count();
  console.log(`Scenario cards found: ${scenarioCount}`);

  // Check if learning system is available
  const systemStatus = await page.evaluate(() => {
    return {
      hasLearningSystem: typeof window.learningSystem !== 'undefined',
      hasScenarioEngine: window.learningSystem && typeof window.learningSystem.scenarioEngine !== 'undefined',
      scenarioEngineInitialized: window.learningSystem && window.learningSystem.scenarioEngine && window.learningSystem.scenarioEngine.initialized
    };
  });
  console.log('Learning system status:', systemStatus);

  console.log('\nPress Ctrl+C to close...');
  await page.waitForTimeout(60000);

  await browser.close();
})();
