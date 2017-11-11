/* eslint-disable no-console */
import request from 'superagent';
import Express from 'express';
import compression from 'compression';
import path from 'path';
import http from 'http';
import { ExpressPeerServer } from 'peer';
import url from 'url';
import fs from 'fs';
import gm from 'gm';
import md5 from 'md5';
import _ from 'lodash';
import circle from 'circle-image';
import passporter from './helpers/passporter';
import normalize from './helpers/normalize';

const gmsc = gm.subClass({ imageMagick: true });
const app = new Express();
const joypadHtml = fs.readFileSync(path.join(__dirname, '../dist/static/joypad/index.html'), 'utf8');
const mirrorHtml = fs.readFileSync(path.join(__dirname, '../dist/static/mirror/index.html'), 'utf8');

const appHost = process.env.GLOBAL_HOST || 'localhost';
const appPort = Number(process.env.GLOBAL_PORT || 3000);
const base = normalize(`${appHost}:${appPort}`);
const stages = [];

app.get('*', (req, res, next) => {
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    res.redirect(`${base}${req.url}`);
  } else {
    next();
  }
});
app.use(compression());
app.use(Express.static(path.join(__dirname, '../dist/static')));
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
app.put('/api/stages/:id', (req, res) => {
  stages.push(req.params.id);
  res.send({});
});
app.delete('/api/stages/:id', (req, res) => {
  const { id } = req.params;
  _.remove(stages, stage =>
    stage === id);
  res.send({});
});
app.get('/api/stages/:id/other', (req, res) => {
  res.send({
    stage: _.sample(stages.filter(stage => stage !== req.params.id)),
  });
});

passporter.use({
  appId: process.env.POTATEMAN_FACEBOOK_CLIENT_ID,
  secret: process.env.POTATEMAN_FACEBOOK_SECRET_ID,
}, app, base);

const server = new http.Server(app);
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
peerServer.on('mount', () => {
  // eslint-disable-next-line no-underscore-dangle
  peerServer._wss.on('connection', (socket) => {
    const { query: { id } } = url.parse(socket.upgradeReq.url, true);
    socket.on('close', () => {
      _.remove(stages, stage =>
        stage === id);
    });
  });
});
app.use('/peerjs', peerServer);
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
