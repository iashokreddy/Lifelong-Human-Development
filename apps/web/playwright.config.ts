import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the LHD web app end-to-end suite.
 *
 * The suite exercises the full live stack: the Next.js production server talks
 * to the NestJS API, which serves the real curriculum content from
 * packages/content. Playwright's `webServer` starts BOTH servers (via
 * e2e/start-stack.mjs) so `npm run e2e` is self-contained from cold.
 */
export default defineConfig({
  testDir: './e2e',
  // Run specs serially-safe: each file is independent, but the shared live
  // stack means we keep workers modest to avoid overwhelming the dev servers.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Build both apps first, then launch API (3001) + web (3000) together.
    command: 'node e2e/start-stack.mjs',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
