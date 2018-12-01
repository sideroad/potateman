/* eslint-disable no-console */
import request from 'superagent';
import Express from 'express';
import compression from 'compression';
import path from 'path';
import http from 'http';
import { ExpressPeerServer } from 'peer';
import url from 'url';
import fs from 'fs-extra';
import _ from 'lodash';
import passporter from './helpers/passporter';
import normalize from './helpers/normalize';

fs.ensureDirSync(path.join(__dirname, 'uploads'));

const app = new Express();
const joypadHtml = fs.readFileSync(
  path.join(__dirname, '../dist/static/joypad/index.html'),
  'utf8'
);
const mirrorHtml = fs.readFileSync(
  path.join(__dirname, '../dist/static/mirror/index.html'),
  'utf8'
);

const appHost = process.env.POTATE_HOST || 'localhost';
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
  _.remove(stages, stage => stage === id);
  res.send({});
});
app.get('/api/stages/:id/other', (req, res) => {
  res.send({
    stage: _.sample(stages.filter(stage => stage !== req.params.id))
  });
});

passporter.use(
  {
    twitter: {
      appId: process.env.POTATEMAN_TWITTER_CLIENT_ID,
      secret: process.env.POTATEMAN_TWITTER_SECRET_ID
    },
    github: {
      appId: process.env.POTATEMAN_GITHUB_CLIENT_ID,
      secret: process.env.POTATEMAN_GITHUB_SECRET_ID
    }
  },
  app,
  base
);

const server = new http.Server(app);
const peerServer = ExpressPeerServer(server, {
  debug: true
});
peerServer.on('mount', () => {
  // eslint-disable-next-line no-underscore-dangle
  peerServer._wss.on('connection', (socket, req) => {
    socket.upgradeReq = req;
    const {
      query: { id }
    } = url.parse(socket.upgradeReq.url, true);
    socket.on('close', () => {
      _.remove(stages, stage => stage === id);
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
