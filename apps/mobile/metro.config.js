// Metro config for the monorepo. Watch the repo root and packages/shared so
// hoisted workspace deps and the raw-TS @lhd/shared source resolve, and add the
// root node_modules to the resolver search path.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot, path.resolve(monorepoRoot, 'packages/shared')];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
