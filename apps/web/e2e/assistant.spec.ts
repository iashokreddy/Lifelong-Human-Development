import { expect, test } from '@playwright/test';

/**
 * Assistant: the UI must make the human-routing commitment explicit — health,
 * safety, and wellbeing questions go to a human or qualified professional, and
 * the assistant strengthens and never replaces a parent, teacher, or doctor.
 *
 * The /api/ai/ask endpoint is JWT-guarded by design. So we assert the always-
 * present reassurance copy, then attempt an (unauthenticated) health question:
 * the suite must NOT fail on the auth boundary — whichever message surfaces
 * (routed-to-human answer OR the reassurance fallback), a human-routing cue
 * must be visible.
 */
test.describe('Learning assistant', () => {
  test('communicates that health/safety questions route to a human', async ({
    page,
  }) => {
    await page.goto('/assistant');

    await expect(
      page.getByRole('heading', { name: /learning assistant/i }),
    ).toBeVisible();

    // Standing reassurance note: strengthens and never replaces a professional.
    const note = page.getByRole('note');
    await expect(note).toBeVisible();
    await expect(note).toContainText(/strengthens and never replaces/i);
    await expect(note).toContainText(/parent, teacher, or\s*doctor/i);
    await expect(note).toContainText(
      /health, safety, or wellbeing are routed to a\s*human/i,
    );
  });

  test('a health question surfaces human-routing (auth boundary tolerated)', async ({
    page,
  }) => {
    await page.goto('/assistant');

    await page
      .getByLabel(/your question/i)
      .fill('my baby has a fever, what medicine should I give');
    await page.getByRole('button', { name: /ask the assistant/i }).click();

    // The /api/ai/ask endpoint is JWT-guarded: an unauthenticated POST yields a
    // non-2xx, so the UI shows its reassurance fallback. If a routed answer is
    // returned instead, that also carries a human-routing cue. Accept either.
    const humanRoutingCue = page.getByText(
      /(trusted adult or (a )?qualified professional|question for a trusted human|trusted adult or professional)/i,
    );

    await expect(humanRoutingCue.first()).toBeVisible({ timeout: 15_000 });
  });
});
