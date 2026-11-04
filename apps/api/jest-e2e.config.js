/** End-to-end test config (ts-jest, no preset). Runs *.e2e-spec.ts under test/. */
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.e2e-spec.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
};
