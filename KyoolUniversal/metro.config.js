const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for React Native Web
config.resolver.platforms = ['web', 'native', 'ios', 'android'];
config.resolver.alias = {
  'react-native$': 'react-native-web',
};

// Metro server configuration for proper URI generation
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      // Log requests for debugging
      if (req.url && (req.url.includes('oauth') || req.url.includes('auth'))) {
        console.log('Metro handling auth request:', req.url);
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;