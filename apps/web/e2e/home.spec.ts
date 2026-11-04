import { expect, test } from '@playwright/test';

/**
 * Home page: must restate the guiding philosophy (learn how to think) and the
 * non-negotiable rule that the platform strengthens — and never replaces —
 * parents, teachers, doctors, and human relationships. It also shows the
 * 0 -> 40+ lifelong journey rendered from the live API catalog.
 */
test.describe('Home page', () => {
  test('renders the guiding philosophy and the never-replace commitment', async ({
    page,
  }) => {
    await page.goto('/');

    // Hero: the 0-to-100 lifelong framing.
    await expect(
      page.getByRole('heading', { name: /0 to 100/i }),
    ).toBeVisible();

    // Philosophy: "how to think", not what to think.
    await expect(page.getByText(/how to think/i).first()).toBeVisible();
    await expect(
      page.getByText(/torch-bearer/i).first(),
    ).toBeVisible();

    // Non-negotiable rule: strengthens and never replaces human relationships.
    // Scoped to the guiding-principle banner (the same commitment also appears
    // in the site footer, so an unscoped text match is ambiguous).
    const banner = page.getByRole('complementary', {
      name: /our guiding principle/i,
    });
    await expect(
      banner.getByText(/strengthens and never replaces/i),
    ).toBeVisible();
    await expect(
      banner.getByText(/parents, teachers,\s*doctors/i),
    ).toBeVisible();
  });

  test('shows the 0 -> 40+ lifelong journey from the live catalog', async ({
    page,
  }) => {
    await page.goto('/');

    const journey = page.getByRole('navigation', {
      name: /lifelong development journey/i,
    });
    await expect(journey).toBeVisible();

    // Earliest and latest life stages both present (0–3 through 40+).
    await expect(journey.getByText('0–3').first()).toBeVisible();
    await expect(journey.getByText('40+').first()).toBeVisible();

    // The journey lists every phase in the catalog.
    await expect(journey.getByRole('link')).toHaveCount(13);
  });
});
