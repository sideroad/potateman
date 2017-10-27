const path = require('path');
const WebpackOnBuildPlugin = require('on-build-webpack');

module.exports = {
  entry: {
    main: ['./src/client.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist/static'),
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loaders: 'buble-loader',
        include: path.join(__dirname, 'src'),
        query: {
          objectAssign: 'Object.assign',
        },
      },
    ],
  },
  plugins: [
    new WebpackOnBuildPlugin((stats) => {
      // eslint-disable-next-line
      const fs = require('fs');
      const bundleName = Object.keys(stats.compilation.assets)[0];
      const htmlPath = path.resolve(__dirname, 'dist/static/index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      // eslint-disable-next-line prefer-template
      fs.writeFileSync(htmlPath, html.replace('/bundle.js', '/' + bundleName), 'utf8');
    }),
  ],
  externals: {
    fs: {},
  },
};
