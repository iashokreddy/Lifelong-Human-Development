/** Unit test config (ts-jest, no preset). Runs *.spec.ts under src/. */
module.exports = {
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.spec.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.json',
      },
    ],
  },
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: '../coverage',
};
