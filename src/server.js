/* eslint-disable no-console */
import request from 'superagent';
import Express from 'express';
import compression from 'compression';
import path from 'path';
import http from 'http';
import { ExpressPeerServer } from 'peer';
import fs from 'fs';
import gm from 'gm';
import md5 from 'md5';
import circle from 'circle-image';
import passporter from './helpers/passporter';

const gmsc = gm.subClass({ imageMagick: true });
const app = new Express();
const joypadHtml = fs.readFileSync(path.join(__dirname, '../dist/static/joypad/index.html'), 'utf8');
const mirrorHtml = fs.readFileSync(path.join(__dirname, '../dist/static/mirror/index.html'), 'utf8');
app.use(compression());
app.use(Express.static(path.join(__dirname, '../dist/static'), {
  maxAge: '1d',
}));
app.get('/ic', (req, res) => {
  const size = Number(req.query.size) || 50;
  const filename = Number(md5(req.query.url + size).replace(/[a-z]/g, '').substr(0, 20));
  const file = `./uploads/${filename}`;
  const circleFile = `./uploads/circle_user_${filename}_${size}.png`;
  if (fs.existsSync(circleFile)) {
    res.send(fs.readFileSync(circleFile));
    return;
  }
  request(req.query.url)
    .responseType('blob')
    .end((err, binary) => {
      fs.writeFileSync(file, binary.body);
      gmsc(file)
        .resize(size * 2, size * 2)
        .setFormat('png')
        .write(file, () => {
          circle.execute(file, filename, [size])
            .then((paths) => {
              res.send(fs.readFileSync(paths[0]));
            }, _err => console.log(_err));
        });
    });
});
app.get('/joypad/:stage/', (req, res) => {
  res.send(joypadHtml);
});
app.get('/mirror/:stage/', (req, res) => {
  res.send(mirrorHtml);
});
function normalize(url) {
  let protocol = (url.match(/(http|https):\/\//) || [])[1];
  if (/:443$/.test(url)) {
    protocol = protocol || 'https';
  } else {
    protocol = 'http';
  }
  return `${protocol}://${url.replace(/(:80|:443)$/, '')}`;
}

const appHost = process.env.GLOBAL_HOST || 'localhost';
const appPort = Number(process.env.GLOBAL_PORT || 3000);
const base = normalize(`${appHost}:${appPort}`);

passporter.use({
  appId: process.env.POTATEMAN_FACEBOOK_CLIENT_ID,
  secret: process.env.POTATEMAN_FACEBOOK_SECRET_ID,
}, app, base);

const server = new http.Server(app);

app.use('/peerjs', ExpressPeerServer(server, {
  debug: true,
}));
server.on('connection', () => {
  console.log('peer connected!');
});
server.on('disconnect', () => {
  console.log('peer disconnect!');
});
server.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    console.error(err);
  }
});
