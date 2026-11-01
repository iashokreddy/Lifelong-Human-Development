module.exports = {
  // Local wrapper preset: forces react-native and its jest helpers to resolve
  // from THIS workspace's SDK-51 copy instead of the newer react-native npm
  // hoists to the repo root (see jest-preset.js for the full explanation).
  preset: './jest-preset.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Pin all react-native imports to the SDK-51 copy nested in this workspace
    // so app code never picks up the root-hoisted newer react-native.
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^react-native/(.*)$': '<rootDir>/node_modules/react-native/$1',
    // @lhd/shared ships raw ESM TypeScript with no build step; point Jest at
    // the source so the Babel transform compiles it alongside app code.
    '^@lhd/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  // Extend the jest-expo default ignore list with @lhd/shared so its raw TS is
  // transformed instead of being left as untranspiled ESM.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@lhd/shared))',
  ],
};
