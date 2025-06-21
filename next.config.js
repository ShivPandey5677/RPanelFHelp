// next.config.js
module.exports = {
  webpack(config) {
    config.resolve.fallback = {
      bufferutil: false,
      'utf-8-validate': false,
    };
    return config;
  },
};