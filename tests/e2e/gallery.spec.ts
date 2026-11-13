import { expect, test } from '@playwright/test';

test.describe('Silvia Art Gallery', () => {
  test('renders homepage, switches to grid, and opens a painting detail via View Transitions', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Silvia Art/);
    await expect(page.locator('article[data-painting-id]').first()).toBeVisible();

    // Navigate to Grid via ViewSwitcher
    await page.locator('[data-nav-view="grid"]').click();
    await expect(page).toHaveURL(/\/grid\/?$/);
    const gridItems = page.locator('[data-grid-item]');
    await expect(gridItems.first()).toBeVisible();

    // Open first painting detail
    const firstId = await gridItems.first().getAttribute('data-grid-item');
    await gridItems.first().click();
    await expect(page).toHaveURL(new RegExp(`/p/${firstId}/?$`));

    // Verify NEXT navigation and keyboard Escape back to grid
    const nextButton = page.locator('[data-painting-next]');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).not.toHaveURL(new RegExp(`/p/${firstId}/?$`));
    }

    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/grid\/?$/);
  });

  test('persists dark theme selection across View Transitions', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-theme-value="dark"]').click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.locator('[data-nav-view="grid"]').click();
    await expect(page).toHaveURL(/\/grid\/?$/);
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('opens share page and shows copy confirmation', async ({ page }) => {
    await page.goto('/grid');
    const firstId = await page.locator('[data-grid-item]').first().getAttribute('data-grid-item');
    await page.goto(`/p/${firstId}/share`);

    await expect(page.getByText('Share Painting')).toBeVisible();
    await page.locator('[data-copy-share]').click();
    await expect(page.locator('[data-copy-feedback]')).toBeVisible();
  });
});
