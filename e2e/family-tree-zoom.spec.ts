import { test, expect } from '@playwright/test';

test.describe('Family Tree Zoom Controls', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for the app to load
    await page.waitForSelector('text=Silsilah Keluarga', { timeout: 10000 });
  });

  test('should display zoom controls', async ({ page }) => {
    // Check that zoom control buttons are visible
    await expect(page.getByTitle('Perbesar')).toBeVisible();
    await expect(page.getByTitle('Perkecil')).toBeVisible();
    await expect(page.getByTitle('Fit ke Layar')).toBeVisible();
  });

  test('should display zoom level indicator', async ({ page }) => {
    // Check that zoom level is displayed
    await expect(page.getByText('100%')).toBeVisible();
  });

  test('should zoom in when zoom in button is clicked', async ({ page }) => {
    // Get initial zoom level
    const initialZoom = await page.getByText('100%').textContent();
    
    // Click zoom in button
    await page.getByTitle('Perbesar').click();
    
    // Wait for zoom level to change
    await page.waitForTimeout(500);
    
    // Verify zoom level increased (should be > 100%)
    const newZoom = await page.locator('.zoom-level').textContent();
    expect(parseInt(newZoom || '100')).toBeGreaterThan(100);
  });

  test('should zoom out when zoom out button is clicked', async ({ page }) => {
    // First zoom in to have room to zoom out
    await page.getByTitle('Perbesar').click();
    await page.waitForTimeout(500);
    
    // Get current zoom level
    const currentZoom = await page.locator('.zoom-level').textContent();
    
    // Click zoom out button
    await page.getByTitle('Perkecil').click();
    
    // Wait for zoom level to change
    await page.waitForTimeout(500);
    
    // Verify zoom level decreased
    const newZoom = await page.locator('.zoom-level').textContent();
    expect(parseInt(newZoom || '100')).toBeLessThan(parseInt(currentZoom || '100'));
  });

  test('should reset zoom when fit to screen button is clicked', async ({ page }) => {
    // Zoom in first
    await page.getByTitle('Perbesar').click();
    await page.waitForTimeout(500);
    
    // Click reset/fit to screen button
    await page.getByTitle('Fit ke Layar').click();
    
    // Wait for zoom to reset
    await page.waitForTimeout(1000);
    
    // Verify zoom level is back to 100%
    await expect(page.getByText('100%')).toBeVisible();
  });

  test('should display POV toggle button', async ({ page }) => {
    // Check that POV toggle button is visible
    await expect(page.getByTitle(/POV:/)).toBeVisible();
  });

  test('should toggle POV when POV button is clicked', async ({ page }) => {
    // Get initial POV state
    const initialPov = await page.getByTitle(/POV:/).textContent();
    
    // Click POV toggle button
    await page.getByTitle(/POV:/).click();
    
    // Wait for POV to change
    await page.waitForTimeout(500);
    
    // Verify POV changed
    const newPov = await page.getByTitle(/POV:/).textContent();
    expect(newPov).not.toBe(initialPov);
  });
});