const path = require('path');
const WebpackOnBuildPlugin = require('on-build-webpack');

module.exports = {
  entry: {
    main: ['./src/client.js'],
    mirror: ['./src/mirror/mirror.js'],
    joypad: ['./src/joypad/joypad.js'],
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
      const assetNames = Object.keys(stats.compilation.assets);

      // replace to bundle
      const bundleName = assetNames.find(name => /^main-/.test(name));
      const htmlPath = path.resolve(__dirname, 'dist/static/index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      // eslint-disable-next-line prefer-template
      fs.writeFileSync(htmlPath, html.replace('/bundle.js', '/' + bundleName), 'utf8');

      // replace to mirror
      const mirrorName = assetNames.find(name => /^mirror-/.test(name));
      const mirrorHtmlPath = path.resolve(__dirname, 'dist/static/mirror/index.html');
      const mirrorHtml = fs.readFileSync(mirrorHtmlPath, 'utf8');
      // eslint-disable-next-line prefer-template
      fs.writeFileSync(mirrorHtmlPath, mirrorHtml.replace('/bundle-mirror.js', '/' + mirrorName), 'utf8');

      // replace to joypad
      const joypadName = assetNames.find(name => /^joypad-/.test(name));
      const joypadHtmlPath = path.resolve(__dirname, 'dist/static/joypad/index.html');
      const joypadHtml = fs.readFileSync(joypadHtmlPath, 'utf8');
      const joypadCssPath = path.resolve(__dirname, 'dist/static/joypad/joypad.css');
      const joypadCss = fs.readFileSync(joypadCssPath, 'utf8');
      const version = new Date().getTime();
      // eslint-disable-next-line prefer-template
      const joypadNewCssPath = path.resolve(__dirname, 'dist/static/joypad/joypad-' + version + '.css');
      fs.writeFileSync(joypadNewCssPath, joypadCss, 'utf8');
      fs.writeFileSync(joypadHtmlPath, joypadHtml
        // eslint-disable-next-line prefer-template
        .replace('/joypad.js', '/' + joypadName)
        // eslint-disable-next-line prefer-template
        .replace('/joypad.css', '/joypad-' + version + '.css'), 'utf8');
    }),
  ],
  externals: {
    fs: {},
    express: {},
  },
};
