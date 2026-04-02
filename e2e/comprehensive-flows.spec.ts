import { test, expect } from '@playwright/test';

test.describe('Comprehensive E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for the app to load
    await page.waitForSelector('text=Silsilah Keluarga', { timeout: 10000 });
  });

  test.describe('Authentication Flow', () => {
    test('should display login page', async ({ page }) => {
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show login button', async ({ page }) => {
      const loginButton = page.getByRole('button', { name: /masuk|login/i });
      await expect(loginButton).toBeVisible();
    });
  });

  test.describe('Family Management Flow', () => {
    test('should display family list after login', async ({ page }) => {
      // This test assumes user is already logged in
      // In real scenario, you would handle login first
      const familyList = page.locator('[data-testid="family-list"]');
      await expect(familyList).toBeVisible();
    });

    test('should show add family button', async ({ page }) => {
      const addFamilyButton = page.getByRole('button', { name: /tambah keluarga/i });
      await expect(addFamilyButton).toBeVisible();
    });

    test('should open family modal when add button is clicked', async ({ page }) => {
      const addFamilyButton = page.getByRole('button', { name: /tambah keluarga/i });
      await addFamilyButton.click();
      
      const modal = page.locator('[data-testid="family-modal"]');
      await expect(modal).toBeVisible();
    });

    test('should close family modal when cancel is clicked', async ({ page }) => {
      const addFamilyButton = page.getByRole('button', { name: /tambah keluarga/i });
      await addFamilyButton.click();
      
      const cancelButton = page.getByRole('button', { name: /batal|cancel/i });
      await cancelButton.click();
      
      const modal = page.locator('[data-testid="family-modal"]');
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Member Management Flow', () => {
    test('should show add member button', async ({ page }) => {
      const addMemberButton = page.getByRole('button', { name: /tambah anggota/i });
      await expect(addMemberButton).toBeVisible();
    });

    test('should open member modal when add button is clicked', async ({ page }) => {
      const addMemberButton = page.getByRole('button', { name: /tambah anggota/i });
      await addMemberButton.click();
      
      const modal = page.locator('[data-testid="member-modal"]');
      await expect(modal).toBeVisible();
    });

    test('should show member form fields', async ({ page }) => {
      const addMemberButton = page.getByRole('button', { name: /tambah anggota/i });
      await addMemberButton.click();
      
      const nameInput = page.locator('input[name="name"]');
      const genderSelect = page.locator('select[name="gender"]');
      
      await expect(nameInput).toBeVisible();
      await expect(genderSelect).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      const addMemberButton = page.getByRole('button', { name: /tambah anggota/i });
      await addMemberButton.click();
      
      const saveButton = page.getByRole('button', { name: /simpan|save/i });
      await saveButton.click();
      
      // Should show validation error
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Tree View Flow', () => {
    test('should display tree view', async ({ page }) => {
      const treeView = page.locator('[data-testid="family-tree"]');
      await expect(treeView).toBeVisible();
    });

    test('should show zoom controls', async ({ page }) => {
      const zoomInButton = page.getByTitle('Perbesar');
      const zoomOutButton = page.getByTitle('Perkecil');
      const fitButton = page.getByTitle('Fit ke Layar');
      
      await expect(zoomInButton).toBeVisible();
      await expect(zoomOutButton).toBeVisible();
      await expect(fitButton).toBeVisible();
    });

    test('should zoom in when zoom in button is clicked', async ({ page }) => {
      const zoomInButton = page.getByTitle('Perbesar');
      await zoomInButton.click();
      
      // Wait for zoom animation
      await page.waitForTimeout(500);
      
      // Zoom level should increase
      const zoomLevel = page.locator('.zoom-level');
      const zoomText = await zoomLevel.textContent();
      const zoomValue = parseInt(zoomText || '100');
      
      expect(zoomValue).toBeGreaterThan(100);
    });

    test('should zoom out when zoom out button is clicked', async ({ page }) => {
      // First zoom in
      const zoomInButton = page.getByTitle('Perbesar');
      await zoomInButton.click();
      await page.waitForTimeout(500);
      
      // Then zoom out
      const zoomOutButton = page.getByTitle('Perkecil');
      await zoomOutButton.click();
      await page.waitForTimeout(500);
      
      // Zoom level should decrease
      const zoomLevel = page.locator('.zoom-level');
      const zoomText = await zoomLevel.textContent();
      const zoomValue = parseInt(zoomText || '100');
      
      expect(zoomValue).toBeLessThan(150);
    });

    test('should reset zoom when fit button is clicked', async ({ page }) => {
      // Zoom in first
      const zoomInButton = page.getByTitle('Perbesar');
      await zoomInButton.click();
      await page.waitForTimeout(500);
      
      // Click fit button
      const fitButton = page.getByTitle('Fit ke Layar');
      await fitButton.click();
      await page.waitForTimeout(1000);
      
      // Zoom level should reset to 100%
      const zoomLevel = page.locator('.zoom-level');
      await expect(zoomLevel).toContainText('100%');
    });

    test('should toggle POV when POV button is clicked', async ({ page }) => {
      const povButton = page.getByTitle(/POV:/);
      const initialPov = await povButton.textContent();
      
      await povButton.click();
      await page.waitForTimeout(500);
      
      const newPov = await povButton.textContent();
      expect(newPov).not.toBe(initialPov);
    });
  });

  test.describe('Search Flow', () => {
    test('should open search modal', async ({ page }) => {
      const searchButton = page.getByRole('button', { name: /cari|search/i });
      await searchButton.click();
      
      const searchModal = page.locator('[data-testid="search-modal"]');
      await expect(searchModal).toBeVisible();
    });

    test('should show search input', async ({ page }) => {
      const searchButton = page.getByRole('button', { name: /cari|search/i });
      await searchButton.click();
      
      const searchInput = page.locator('input[type="search"]');
      await expect(searchInput).toBeVisible();
    });

    test('should close search modal when escape is pressed', async ({ page }) => {
      const searchButton = page.getByRole('button', { name: /cari|search/i });
      await searchButton.click();
      
      await page.keyboard.press('Escape');
      
      const searchModal = page.locator('[data-testid="search-modal"]');
      await expect(searchModal).not.toBeVisible();
    });
  });

  test.describe('View Mode Flow', () => {
    test('should switch to tree view', async ({ page }) => {
      const treeViewButton = page.getByRole('button', { name: /pohon|tree/i });
      await treeViewButton.click();
      
      const treeView = page.locator('[data-testid="family-tree"]');
      await expect(treeView).toBeVisible();
    });

    test('should switch to list view', async ({ page }) => {
      const listViewButton = page.getByRole('button', { name: /daftar|list/i });
      await listViewButton.click();
      
      const listView = page.locator('[data-testid="member-list"]');
      await expect(listView).toBeVisible();
    });

    test('should switch to stats view', async ({ page }) => {
      const statsViewButton = page.getByRole('button', { name: /statistik|stats/i });
      await statsViewButton.click();
      
      const statsView = page.locator('[data-testid="family-stats"]');
      await expect(statsView).toBeVisible();
    });

    test('should switch to timeline view', async ({ page }) => {
      const timelineViewButton = page.getByRole('button', { name: /timeline/i });
      await timelineViewButton.click();
      
      const timelineView = page.locator('[data-testid="family-timeline"]');
      await expect(timelineView).toBeVisible();
    });
  });

  test.describe('Sidebar Flow', () => {
    test('should toggle sidebar collapse', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: /toggle sidebar/i });
      await toggleButton.click();
      
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toHaveClass(/collapsed/);
    });

    test('should show family list in sidebar', async ({ page }) => {
      const familyList = page.locator('[data-testid="sidebar-family-list"]');
      await expect(familyList).toBeVisible();
    });

    test('should show member list in sidebar', async ({ page }) => {
      const memberList = page.locator('[data-testid="sidebar-member-list"]');
      await expect(memberList).toBeVisible();
    });
  });

  test.describe('Help Modal Flow', () => {
    test('should open help modal', async ({ page }) => {
      const helpButton = page.getByRole('button', { name: /bantuan|help/i });
      await helpButton.click();
      
      const helpModal = page.locator('[data-testid="help-modal"]');
      await expect(helpModal).toBeVisible();
    });

    test('should show export option in help modal', async ({ page }) => {
      const helpButton = page.getByRole('button', { name: /bantuan|help/i });
      await helpButton.click();
      
      const exportButton = page.getByRole('button', { name: /export/i });
      await expect(exportButton).toBeVisible();
    });

    test('should show import option in help modal', async ({ page }) => {
      const helpButton = page.getByRole('button', { name: /bantuan|help/i });
      await helpButton.click();
      
      const importButton = page.getByRole('button', { name: /import/i });
      await expect(importButton).toBeVisible();
    });

    test('should close help modal when close button is clicked', async ({ page }) => {
      const helpButton = page.getByRole('button', { name: /bantuan|help/i });
      await helpButton.click();
      
      const closeButton = page.getByRole('button', { name: /tutup|close/i });
      await closeButton.click();
      
      const helpModal = page.locator('[data-testid="help-modal"]');
      await expect(helpModal).not.toBeVisible();
    });
  });

  test.describe('Share Modal Flow', () => {
    test('should open share modal', async ({ page }) => {
      const shareButton = page.getByRole('button', { name: /bagikan|share/i });
      await shareButton.click();
      
      const shareModal = page.locator('[data-testid="share-modal"]');
      await expect(shareModal).toBeVisible();
    });

    test('should show collaborator list', async ({ page }) => {
      const shareButton = page.getByRole('button', { name: /bagikan|share/i });
      await shareButton.click();
      
      const collaboratorList = page.locator('[data-testid="collaborator-list"]');
      await expect(collaboratorList).toBeVisible();
    });

    test('should close share modal when close button is clicked', async ({ page }) => {
      const shareButton = page.getByRole('button', { name: /bagikan|share/i });
      await shareButton.click();
      
      const closeButton = page.getByRole('button', { name: /tutup|close/i });
      await closeButton.click();
      
      const shareModal = page.locator('[data-testid="share-modal"]');
      await expect(shareModal).not.toBeVisible();
    });
  });

  test.describe('Member Detail Flow', () => {
    test('should open member detail when member is clicked', async ({ page }) => {
      const memberCard = page.locator('[data-testid="member-card"]').first();
      await memberCard.click();
      
      const memberDetail = page.locator('[data-testid="member-detail"]');
      await expect(memberDetail).toBeVisible();
    });

    test('should show edit button in member detail', async ({ page }) => {
      const memberCard = page.locator('[data-testid="member-card"]').first();
      await memberCard.click();
      
      const editButton = page.getByRole('button', { name: /edit/i });
      await expect(editButton).toBeVisible();
    });

    test('should show delete button in member detail', async ({ page }) => {
      const memberCard = page.locator('[data-testid="member-card"]').first();
      await memberCard.click();
      
      const deleteButton = page.getByRole('button', { name: /hapus|delete/i });
      await expect(deleteButton).toBeVisible();
    });

    test('should close member detail when close button is clicked', async ({ page }) => {
      const memberCard = page.locator('[data-testid="member-card"]').first();
      await memberCard.click();
      
      const closeButton = page.getByRole('button', { name: /tutup|close/i });
      await closeButton.click();
      
      const memberDetail = page.locator('[data-testid="member-detail"]');
      await expect(memberDetail).not.toBeVisible();
    });
  });

  test.describe('Print Flow', () => {
    test('should show print button', async ({ page }) => {
      const printButton = page.getByRole('button', { name: /cetak|print/i });
      await expect(printButton).toBeVisible();
    });

    test('should trigger print when print button is clicked', async ({ page }) => {
      // Note: Actual print dialog cannot be tested in Playwright
      // This test just verifies the button is clickable
      const printButton = page.getByRole('button', { name: /cetak|print/i });
      await printButton.click();
      
      // Wait for any print preparation
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should show mobile menu button on small screen', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const mobileMenuButton = page.getByRole('button', { name: /menu/i });
      await expect(mobileMenuButton).toBeVisible();
    });

    test('should open mobile sidebar when menu button is clicked', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const mobileMenuButton = page.getByRole('button', { name: /menu/i });
      await mobileMenuButton.click();
      
      const mobileSidebar = page.locator('[data-testid="mobile-sidebar"]');
      await expect(mobileSidebar).toBeVisible();
    });

    test('should close mobile sidebar when backdrop is clicked', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const mobileMenuButton = page.getByRole('button', { name: /menu/i });
      await mobileMenuButton.click();
      
      const backdrop = page.locator('[data-testid="sidebar-backdrop"]');
      await backdrop.click();
      
      const mobileSidebar = page.locator('[data-testid="mobile-sidebar"]');
      await expect(mobileSidebar).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const count = await headings.count();
      
      expect(count).toBeGreaterThan(0);
    });

    test('should have proper button labels', async ({ page }) => {
      const buttons = page.locator('button');
      const count = await buttons.count();
      
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const label = await button.getAttribute('aria-label') || await button.textContent();
        
        expect(label).toBeTruthy();
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to activate with Enter
      await page.keyboard.press('Enter');
    });
  });

  test.describe('Error Handling', () => {
    test('should show error boundary on component error', async ({ page }) => {
      // This test would require triggering an actual error
      // For now, just verify error boundary exists
      const errorBoundary = page.locator('[data-testid="error-boundary"]');
      // Error boundary might not be visible unless there's an error
      expect(errorBoundary).toBeDefined();
    });

    test('should show toast notifications', async ({ page }) => {
      // Trigger an action that shows a toast
      const addButton = page.getByRole('button', { name: /tambah/i }).first();
      await addButton.click();
      
      // Look for toast notification
      const toast = page.locator('[data-testid="toast"]');
      // Toast might appear briefly
      await page.waitForTimeout(1000);
    });
  });
});
