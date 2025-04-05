const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      clean: true, // Cleans the dist folder before each build
      assetModuleFilename: 'images/[name][ext]', // Output directory for .webp files
    },
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader', // Use MiniCssExtractPlugin in production
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|webp)$/i, // Add .webp to the test
          type: 'asset/resource', // Use Webpack's asset modules for handling .webp files
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProduction ? '[name].[contenthash].css' : '[name].css', // Add hash for production
      }),
    ],
    devtool: isProduction ? false : 'eval-source-map', // Disable source maps in production
  };
};