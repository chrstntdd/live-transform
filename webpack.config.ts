import path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import WebpackModules from 'webpack-modules'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import InterpolatePlugin from 'react-dev-utils/InterpolateHtmlPlugin'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
const IS_SSR = process.env.SSR === 'true'

import { clientDevBuild, serverProdBuild, serverDevBuild } from './paths'

const publicPath = '/'

try {
  var normalizeString = fs.readFileSync(
    path.join(__dirname, 'node_modules/normalize.css/normalize.css'),
    'UTF-8'
  )
} catch (error) {}

const config = {
  context: __dirname,

  mode: IS_PRODUCTION ? 'production' : IS_DEVELOPMENT && 'development',

  bail: IS_PRODUCTION,

  devtool: IS_PRODUCTION ? 'source-map' : 'cheap-module-source-map',

  devServer: {
    compress: true,
    contentBase: clientDevBuild,
    historyApiFallback: true,
    useLocalIp: true,
    host: '0.0.0.0',
    overlay: {
      warnings: true,
      errors: true
    }
  },

  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    runtimeChunk: !IS_SSR
  },

  entry: path.resolve(__dirname, 'source/index'),

  output: {
    path: IS_PRODUCTION
      ? clientDevBuild
      : IS_SSR && IS_PRODUCTION
      ? serverProdBuild
      : IS_SSR && IS_DEVELOPMENT
      ? serverDevBuild
      : undefined,
    pathinfo: IS_DEVELOPMENT,
    filename: 'static/js/[name].[hash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    publicPath,
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },

  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
    modules: ['node_modules']
  },

  module: {
    exprContextCritical: false,
    strictExportPresence: true,
    rules: [
      {
        oneOf: [
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.client.json'
            }
          },

          {
            test: /\.css/,
            use: [
              IS_PRODUCTION ? MiniCssExtractPlugin.loader : 'style-loader',
              { loader: 'css-loader', options: { sourceMap: true } }
            ].filter(Boolean)
          }
        ]
      }
    ]
  },

  plugins: [
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin(
      Object.assign(
        {},
        {
          inject: true,
          template: path.resolve(__dirname, 'source/index.html')
        },
        IS_PRODUCTION
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
              }
            }
          : undefined
      )
    ),

    new CleanWebpackPlugin(),

    // new MonacoWebpackPlugin(),

    new InterpolatePlugin(HtmlWebpackPlugin, {
      NORMALIZE: '<style>' + normalizeString + '</style>'
    }),

    IS_PRODUCTION &&
      new MiniCssExtractPlugin({
        filename: './static/css/main.[contenthash:8].css',
        chunkFilename: './static/css/[id].[contenthash:8].css'
      }),

    new WebpackModules(),

    IS_DEVELOPMENT && new webpack.HotModuleReplacementPlugin()
  ].filter(Boolean),

  node: {
    dgram: 'empty',
    fs: 'empty',
    module: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },

  performance: false
}

export default config
