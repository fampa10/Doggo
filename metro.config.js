const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const resolveFrom = require('resolve-from');

const config = getDefaultConfig(__dirname);

// Limit worker pool size to avoid OOM memory pressure on high-core machines
config.maxWorkers = 2;


config.resolver.resolveRequest = (context, moduleName, platform) => {
  // If standard resolution fails, fall back to Node's robust module resolution
  try {
    return context.resolveRequest(context, moduleName, platform);
  } catch (err) {
    try {
      const startDir = context.originModulePath
        ? path.dirname(context.originModulePath)
        : __dirname;
      const resolved = resolveFrom(startDir, moduleName);
      if (resolved) {
        return {
          type: 'sourceFile',
          filePath: resolved,
        };
      }
    } catch (_) {}
    throw err;
  }
};

module.exports = config;
