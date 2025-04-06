const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const glob = require('glob');
const fs = require('fs');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const PATHS = {
  src: path.join(__dirname, "src"),
}

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
     app: './src/main.js',
     vendor: ['jquery']
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[chunkhash].js', // placeholder name (dist/app.js), with hashing [], chunkhash -> unique hash.
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
        {
          test: /\.(webp|png|jpg|jpeg|gif|svg)$/i,
          type: "asset/resource",
          generator: {
            filename: "images/[name][ext]",
          },
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
          type: "asset/resource", // Handles images as separate files
          generator: {
            filename: "images/[name][ext]", // Output directory and file name
          },
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProduction ? '[name].[contenthash].css' : '[name].css', // Add hash for production
      }),
      new PurgeCSSPlugin({
        paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }), // PURGE EXTRA CSS
      }),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["mozjpeg", { quality: 75 }],
              ["pngquant", { quality: [0.65, 0.9] }],
              ["svgo", { removeViewBox: false }],
            ],
          },
        },
      }),
// MANIFEST
      {
        apply(compiler) {
          compiler.hooks.done.tap('GenerateManifestPlugin', (stats) => {
            fs.writeFileSync(
              path.join(__dirname, 'dist/manifest.json'),
              JSON.stringify(stats.toJson())
            );
          });
        },
      },
    ],
    devtool: isProduction ? false : 'eval-source-map', // Disable source maps in production
  };
};