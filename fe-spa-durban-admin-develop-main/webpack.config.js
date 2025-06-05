const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'development', // Set mode to 'development' for better debugging
  entry: path.resolve(__dirname, 'src/App.tsx'), // Entry point for your application
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js', // Dynamic filenames, useful for caching
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'], // Resolve these extensions
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Match TypeScript files
        use: 'ts-loader', // Use ts-loader for TypeScript files
        exclude: /node_modules/, // Exclude node_modules
      },
      {
        test: /\.css$/, // Match CSS files
        use: ['style-loader', 'css-loader'], // Use style-loader and css-loader
      },
    ],
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // Generate a static HTML file
      reportFilename: 'report.html', // Name of the report file
    }),
  ],
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all', // Split vendor code into separate chunks
    },
  },
  devServer: {
    port: 8080, // Development server port
  },
  // Optional: Enable source maps for better debugging
  devtool: 'source-map',
};
