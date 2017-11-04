const klawSync = require('klaw-sync');
const path = require('path');

const list = klawSync('./src/images', { nodir: true })
  .map(file => `/images/${path.basename(file.path)}`)
  .filter(file => /\.(png|jpeg|jpg|gif)$/.test(file));

require('fs').writeFileSync('dist/static/prefetch.json', JSON.stringify(list), 'utf8');
