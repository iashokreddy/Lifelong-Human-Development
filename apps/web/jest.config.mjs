import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Load next.config and .env files in the test environment.
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  // Playwright specs in e2e/ are run by `npm run e2e`, not Jest.
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  moduleNameMapper: {
    // @lhd/shared ships raw ESM TypeScript with no build step; point Jest at
    // the source so the SWC transform compiles it alongside app code.
    '^@lhd/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  // The shared package lives outside apps/web; allow Jest/SWC to transform it.
  transformIgnorePatterns: ['/node_modules/(?!(@lhd/shared)/)'],
};

export default createJestConfig(customJestConfig);
