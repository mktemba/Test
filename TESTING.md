# E2E Testing with Playwright

This document describes how to run and maintain the end-to-end (E2E) tests for the Mahjong Learning Application.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The Mahjong Learning App uses [Playwright](https://playwright.dev/) for automated end-to-end testing. Playwright provides reliable, fast testing across Chromium, Firefox, and WebKit browsers.

### What We Test

- **Navigation**: Lesson navigation, keyboard shortcuts, sidebar interaction
- **Practice Exercises**: Pairs, Pungs, Chows, and Winning Hand exercises
- **Persistence**: LocalStorage, progress tracking, session restoration
- **UI Elements**: Layout, responsive design, accessibility, visual consistency

### Test Coverage

- 4 test suites
- 60+ individual test cases
- Testing across desktop and mobile viewports
- Accessibility compliance checks

## Setup

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

For all browsers:
```bash
npx playwright install
```

## Running Tests

### Basic Commands

Run all tests (headless mode):
```bash
npm test
```

Run tests in headed mode (see browser):
```bash
npm run test:headed
```

Run tests with UI mode (interactive):
```bash
npm run test:ui
```

Run tests in debug mode:
```bash
npm run test:debug
```

View test report:
```bash
npm run test:report
```

### Running Specific Tests

Run a specific test file:
```bash
npx playwright test tests/e2e/navigation.spec.js
```

Run tests matching a pattern:
```bash
npx playwright test --grep "navigation"
```

Run tests on specific browser:
```bash
npx playwright test --project=chromium
```

### Watch Mode

Run tests in watch mode (re-run on file changes):
```bash
npx playwright test --watch
```

## Test Structure

```
tests/
├── e2e/                           # E2E test suites
│   ├── navigation.spec.js         # Navigation and lesson switching
│   ├── practice-exercises.spec.js # Practice exercise interactions
│   ├── persistence.spec.js        # Data persistence and localStorage
│   └── ui-elements.spec.js        # UI components and accessibility
└── fixtures/                      # Shared test utilities
    └── base-page.js               # Page object model base class
```

### Test Files

#### `navigation.spec.js`
Tests for:
- Page loading without errors
- Next/Previous button navigation
- Sidebar navigation
- Keyboard shortcuts (Arrow keys)
- URL state management
- Button enable/disable states

#### `practice-exercises.spec.js`
Tests for:
- Pairs practice (Lesson 7)
- Pungs practice (Lesson 8)
- Chows practice (Lesson 9)
- Winning Hand practice (Lesson 12)
- Tile selection and deselection
- Answer validation
- Accessibility of practice elements

#### `persistence.spec.js`
Tests for:
- LocalStorage data saving
- Session restoration after reload
- Progress tracking
- Completed lessons persistence
- Preference management
- Data validation and sanitization
- Corrupted data handling

#### `ui-elements.spec.js`
Tests for:
- Responsive design (mobile, tablet, desktop)
- Layout components (sidebar, progress bar)
- Animations and transitions
- Content display
- Interactive element states
- Accessibility compliance
- Error states

## Writing Tests

### Page Object Pattern

We use the Page Object pattern for maintainability. The `MahjongBasePage` class provides:

```javascript
const { MahjongBasePage } = require('../fixtures/base-page');

test('my test', async ({ page }) => {
  const basePage = new MahjongBasePage(page);
  await basePage.goto();

  // Navigate to a lesson
  await basePage.navigateToLesson(5);

  // Click next
  await basePage.clickNext();

  // Check if lesson is completed
  const isCompleted = await basePage.isLessonCompleted(1);
});
```

### Common Helpers

**Clear localStorage before test:**
```javascript
test.beforeEach(async ({ page }) => {
  const basePage = new MahjongBasePage(page);
  await basePage.goto();
  await basePage.clearLocalStorage();
  await page.reload();
});
```

**Check localStorage:**
```javascript
const savedData = await basePage.getLocalStorageItem('last_lesson');
```

**Navigate to specific lesson:**
```javascript
await basePage.navigateToLesson(7);
```

### Best Practices

1. **Use descriptive test names:**
   ```javascript
   test('should save current lesson to localStorage when navigating', async () => {
     // ...
   });
   ```

2. **Group related tests:**
   ```javascript
   test.describe('Progress Persistence', () => {
     test('should save progress', async () => { });
     test('should restore progress', async () => { });
   });
   ```

3. **Use fixtures for setup:**
   ```javascript
   test.beforeEach(async ({ page }) => {
     // Common setup
   });
   ```

4. **Wait for state, not time:**
   ```javascript
   // Good
   await page.waitForLoadState('networkidle');

   // Avoid
   await page.waitForTimeout(5000);
   ```

5. **Use explicit assertions:**
   ```javascript
   await expect(basePage.nextButton).toBeVisible();
   await expect(basePage.nextButton).toBeEnabled();
   ```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Run Playwright tests
        run: npm test

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Environment Variables

For CI environments, set:
```bash
CI=true npm test
```

This enables:
- Retries (2 attempts on failure)
- Single worker (no parallel execution)
- Stricter test.only detection

## Test Reports

After running tests, view the HTML report:
```bash
npm run test:report
```

The report includes:
- Test pass/fail status
- Screenshots on failure
- Videos of failed tests
- Execution traces
- Console logs

### Report Location

- HTML Report: `playwright-report/index.html`
- JSON Results: `test-results/results.json`
- Screenshots: `test-results/<test-name>/screenshot.png`
- Videos: `test-results/<test-name>/video.webm`

## Troubleshooting

### Tests Fail to Start

**Issue:** `Error: Cannot find module '@playwright/test'`

**Solution:**
```bash
npm install
npx playwright install chromium
```

### Server Connection Issues

**Issue:** `Error: page.goto: net::ERR_CONNECTION_REFUSED`

**Solution:** The test server should start automatically. If not:
```bash
# Manually start server in another terminal
npm run serve

# Run tests with existing server
npx playwright test
```

### Timeout Errors

**Issue:** Tests timeout waiting for elements

**Solution:**
- Increase timeout in `playwright.config.js`
- Check if app is loading correctly
- Use `page.waitForLoadState('networkidle')` after navigation

### Flaky Tests

**Issue:** Tests pass sometimes, fail other times

**Solution:**
- Replace `waitForTimeout()` with `waitForSelector()` or `waitForLoadState()`
- Use `toBeVisible()` before interacting with elements
- Add `test.describe.configure({ retries: 2 })` for flaky suites

### Browser Not Found

**Issue:** `browserType.launch: Executable doesn't exist`

**Solution:**
```bash
npx playwright install chromium
```

### Screenshots Not Captured

Screenshots are only captured on failure. To always capture:

In `playwright.config.js`:
```javascript
use: {
  screenshot: 'on', // or 'only-on-failure'
}
```

## Debugging Tests

### Using UI Mode (Recommended)

```bash
npm run test:ui
```

This opens an interactive UI where you can:
- Watch tests run
- Time travel through test steps
- Inspect DOM at any point
- View console logs
- See network requests

### Using Debug Mode

```bash
npm run test:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- Set breakpoints
- Inspect locators
- View action logs

### Using Browser DevTools

```bash
npx playwright test --headed --debug
```

Then add `await page.pause()` in your test:
```javascript
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Pauses here for inspection
});
```

### Verbose Output

```bash
npx playwright test --reporter=list --trace=on
```

## Performance

### Parallel Execution

Tests run in parallel by default. Configure workers:

```javascript
// playwright.config.js
workers: process.env.CI ? 1 : 4
```

### Optimizations

1. **Reuse server** between test runs (config already enabled)
2. **Use baseURL** for shorter goto calls
3. **Limit retries** in development (0 retries)
4. **Run specific suites** instead of all tests during development

## Coverage

To see which parts of the app are tested:

```bash
# Run all tests
npm test

# Check test results
npm run test:report
```

Current coverage:
- ✅ Navigation (100%)
- ✅ Practice Exercises (90%)
- ✅ Persistence (95%)
- ✅ UI/Accessibility (85%)

## Contributing

When adding new features:

1. Add corresponding tests
2. Update this documentation
3. Ensure all tests pass
4. Add screenshots for visual changes

### Test Checklist

- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests check accessibility
- [ ] Tests are not flaky
- [ ] Tests use page objects
- [ ] Tests have descriptive names

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI Integration](https://playwright.dev/docs/ci)

---

**Last Updated:** 2025-10-25
**Playwright Version:** 1.56.1
**Maintained By:** Development Team
