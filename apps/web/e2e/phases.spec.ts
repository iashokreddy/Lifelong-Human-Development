import { expect, test } from '@playwright/test';

/**
 * Phases listing + detail. These assert against the REAL curriculum served by
 * the live NestJS API (packages/content), not fixtures. The /phases index must
 * list all 13 phases; the detail page must resolve by both id (phase-01) and
 * slug (0-3-years) to the same Foundations phase and show real curriculum.
 */
test.describe('Phases', () => {
  test('/phases lists all 13 phases', async ({ page }) => {
    await page.goto('/phases');

    await expect(
      page.getByRole('heading', { name: /development phases/i }),
    ).toBeVisible();

    // One card per catalog entry — exactly 13.
    await expect(page.getByRole('listitem')).toHaveCount(13);

    // Spot-check that recognisable phases across the lifespan are visible.
    await expect(
      page.getByRole('heading', { name: /foundations/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /innovation & leadership/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /legacy & lifelong learning/i }),
    ).toBeVisible();
  });

  test('/phases/phase-01 (by id) shows real curriculum from the API', async ({
    page,
  }) => {
    await page.goto('/phases/phase-01');

    // Real phase content, not an error/empty state.
    await expect(
      page.getByRole('heading', { name: /foundations/i }),
    ).toBeVisible();

    // A development-domain label derived from the real content.
    await expect(
      page.getByText(/physical/i).first(),
    ).toBeVisible();

    // Signature Phase-01 activity/guidance from the curriculum.
    await expect(
      page.getByText(/serve and return/i).first(),
    ).toBeVisible();

    // A real cited source (Nurturing Care Framework, WHO).
    await expect(
      page.getByText(/nurturing care/i).first(),
    ).toBeVisible();
  });

  test('/phases/0-3-years (by slug) resolves to the same Foundations phase', async ({
    page,
  }) => {
    await page.goto('/phases/0-3-years');

    await expect(
      page.getByRole('heading', { name: /foundations/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/serve and return/i).first(),
    ).toBeVisible();
  });
});
