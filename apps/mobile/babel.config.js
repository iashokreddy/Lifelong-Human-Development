const path = require('path');

// babel-preset-expo only enables its expo-router Babel plugin when it can
// `require.resolve('expo-router')` from its OWN location. The preset is hoisted
// to the monorepo root while expo-router stays nested in apps/mobile, so that
// check fails and the plugin that inlines process.env.EXPO_ROUTER_APP_ROOT into
// the expo-router require.context call never runs — the Metro bundle then fails
// with "Invalid call ... EXPO_ROUTER_APP_ROOT". We add the plugin explicitly,
// resolving it from the hoisted preset, so the inlining happens regardless of
// where expo-router is installed.
const expoRouterBabelPlugin = require(
  require.resolve('babel-preset-expo/build/expo-router-plugin', {
    paths: [__dirname],
  }),
).expoRouterBabelPlugin;

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [expoRouterBabelPlugin],
  };
};

// Keep a sensible default for the absolute app root used by the plugin.
process.env.EXPO_ROUTER_APP_ROOT =
  process.env.EXPO_ROUTER_APP_ROOT ?? path.resolve(__dirname, 'app');
