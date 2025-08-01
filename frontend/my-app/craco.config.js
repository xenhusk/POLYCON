const path = require('path');

module.exports = {
  babel: {
    plugins: [
      // Remove console logs in production
      process.env.NODE_ENV === 'production' && 'transform-remove-console'
    ].filter(Boolean)
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Remove console logs in production via Terser
      if (env === 'production') {
        // Find and modify the TerserPlugin
        const terserPlugin = webpackConfig.optimization.minimizer.find(
          plugin => plugin.constructor.name === 'TerserPlugin'
        );
        
        if (terserPlugin) {
          // Ensure the options structure exists
          terserPlugin.options = terserPlugin.options || {};
          terserPlugin.options.terserOptions = terserPlugin.options.terserOptions || {};
          terserPlugin.options.terserOptions.compress = terserPlugin.options.terserOptions.compress || {};
          
          // Add console removal options
          terserPlugin.options.terserOptions.compress.drop_console = true;
          terserPlugin.options.terserOptions.compress.drop_debugger = true;
        }
      }
      return webpackConfig;
    }
  }
};
