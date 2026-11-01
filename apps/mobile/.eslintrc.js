module.exports = {
  extends: 'expo',
  ignorePatterns: ['/dist', '/.expo', '/.expo-export-check', '/web-build'],
  overrides: [
    {
      // Node-run config/tooling files use CommonJS globals like __dirname.
      files: [
        '*.config.js',
        'jest-preset.js',
        '.eslintrc.js',
        'babel.config.js',
      ],
      env: { node: true },
    },
  ],
};
