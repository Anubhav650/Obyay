const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Hermes requires special handling for event polyfills
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    compress: {
      drop_console: false,
    },
  },
};

module.exports = config;
