# E2E Tests with Playwright

## Setup

Playwright is already installed. To install browsers:

```bash
npx playwright install
```

## Running Tests

### Run all E2E tests:
```bash
npm run test:e2e
```

### Run tests with UI mode:
```bash
npm run test:e2e:ui
```

### Run specific test file:
```bash
npx playwright test e2e/family-tree-zoom.spec.ts
```

### Run tests in headed mode (see browser):
```bash
npx playwright test --headed
```

## Test Structure

Tests are located in the `e2e/` directory:

- `family-tree-zoom.spec.ts` - Tests for zoom controls and POV toggle

## Writing Tests

### Basic Test Structure:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('text=App Title');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.getByTitle('Button Title');
    
    // Act
    await button.click();
    
    // Assert
    await expect(page.getByText('Result')).toBeVisible();
  });
});
```

### Common Patterns:

#### Click a button:
```typescript
await page.getByTitle('Perbesar').click();
```

#### Wait for element:
```typescript
await page.waitForSelector('text=Loading...', { timeout: 10000 });
```

#### Check text content:
```typescript
const text = await page.locator('.zoom-level').textContent();
expect(parseInt(text || '100')).toBeGreaterThan(100);
```

#### Wait for timeout:
```typescript
await page.waitForTimeout(500);
```

## Configuration

Playwright config is in `playwright.config.ts`:

- **testDir**: Where test files are located
- **baseURL**: The URL of your app
- **webServer**: Automatically starts dev server before tests
- **projects**: Browser configurations (Chrome, Firefox, Safari)

## Debugging

### Run in debug mode:
```bash
npx playwright test --debug
```

### View test report:
```bash
npx playwright show-report
```

### Generate test code:
```bash
npx playwright codegen http://localhost:3000
```

## CI/CD Integration

For CI environments, tests run with:
- `retries: 2` - Retry failed tests twice
- `workers: 1` - Run tests sequentially
- `trace: 'on-first-retry'` - Capture traces on first retry

## Best Practices

1. **Use semantic selectors**: `getByTitle()`, `getByText()`, `getByRole()`
2. **Wait for elements**: Use `waitForSelector()` or `waitForTimeout()`
3. **Keep tests independent**: Each test should work alone
4. **Use descriptive names**: Test names should explain what they verify
5. **Clean up**: Tests should not leave side effects

## Troubleshooting

### Tests fail with "page.goto: net::ERR_CONNECTION_REFUSED"
- Make sure dev server is running: `npm run dev`
- Or use the webServer config which starts it automatically

### Tests are flaky
- Add `waitForTimeout()` after actions
- Use `waitForSelector()` instead of hard waits
- Check if elements are truly visible before interacting

### Browser not found
- Run: `npx playwright install`
