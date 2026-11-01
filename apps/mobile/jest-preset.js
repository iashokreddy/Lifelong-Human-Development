'use strict';

/*
 * Local jest preset.
 *
 * jest-expo is hoisted to the monorepo root, where it sits next to a newer
 * react-native (pulled up to satisfy the floating `react-native@*` peer deps of
 * several Expo packages). jest-expo's own preset does
 * `require('react-native/jest-preset')`, which from the root resolves that newer
 * react-native — whose jest helper files use TypeScript syntax that
 * babel-preset-expo (SDK 51) cannot parse, so every suite fails to run.
 *
 * This wrapper rebuilds the jest-expo preset but forces `react-native` and its
 * jest helpers to resolve from THIS workspace's SDK-51 copy (0.74.5). We do it
 * by cloning the local react-native jest-preset and layering the exact
 * transforms jest-expo applies on top, then mapping module names so the Expo
 * transform/babel pipeline is used.
 */

const path = require('path');
const cloneDeep = require('lodash/cloneDeep');

const projectRoot = __dirname;

/** Resolve a module from THIS workspace first, then anywhere up the tree. */
function resolveLocal(request) {
  return require.resolve(request, { paths: [projectRoot] });
}

// Clone the LOCAL react-native jest-preset (paths inside it already point at the
// local react-native jest helpers).
const jestPreset = cloneDeep(require(resolveLocal('react-native/jest-preset')));

// jest-expo bits, resolved from the hoisted jest-expo but independent of RN.
const jestExpoDir = path.dirname(resolveLocal('jest-expo/package.json'));
const { withTypescriptMapping } = require(
  path.join(jestExpoDir, 'src/preset/withTypescriptMapping'),
);

// Emulate the alias behaviour of Expo's Metro resolver.
jestPreset.moduleNameMapper = {
  ...(jestPreset.moduleNameMapper || {}),
  '^react-native-vector-icons$': '@expo/vector-icons',
  '^react-native-vector-icons/(.*)': '@expo/vector-icons/$1',
};

// Replace the upstream babel-jest transform with the metro-flavoured one.
const upstreamBabelJest = Object.keys(jestPreset.transform).find(
  (key) => jestPreset.transform[key] === 'babel-jest',
);
if (upstreamBabelJest) {
  delete jestPreset.transform[upstreamBabelJest];
}
jestPreset.transform['\\.[jt]sx?$'] = [
  'babel-jest',
  { caller: { name: 'metro', bundler: 'metro', platform: 'ios' } },
];

// Swap the asset transformer for jest-expo's broader one.
const defaultAssetNamePattern =
  '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$';
delete jestPreset.transform[defaultAssetNamePattern];
const assetNamePattern =
  '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp|ttf|otf|m4v|mov|mp4|mpeg|mpg|webm|aac|aiff|caf|m4a|mp3|wav|html|pdf|obj)$';
jestPreset.transform[assetNamePattern] = path.join(
  jestExpoDir,
  'src/preset/assetFileTransformer.js',
);

// jest-expo's expanded transformIgnorePatterns.
jestPreset.transformIgnorePatterns = [
  '/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  '/node_modules/react-native-reanimated/plugin/',
];

// jest-expo's extra setup file.
if (!Array.isArray(jestPreset.setupFiles)) {
  jestPreset.setupFiles = [];
}
jestPreset.setupFiles.push(path.join(jestExpoDir, 'src/preset/setup.js'));

module.exports = withTypescriptMapping(jestPreset);
