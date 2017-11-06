/* eslint-disable no-console */
import Express from 'express';
import compression from 'compression';
import path from 'path';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { ExpressPeerServer } from 'peer';
import fs from 'fs';
import passporter from './helpers/passporter';

const app = new Express();
const joypadHtml = fs.readFileSync(path.join(__dirname, '../dist/static/joypad/index.html'), 'utf8');
const mirrorHtml = fs.readFileSync(path.join(__dirname, '../dist/static/mirror/index.html'), 'utf8');
app.use(compression());
app.use(Express.static(path.join(__dirname, '../dist/static'), {
  maxAge: '1d',
}));
app.get('/joypad/:stage/', (req, res) => {
  res.send(joypadHtml);
});
app.get('/mirror/:stage/', (req, res) => {
  res.send(mirrorHtml);
});
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
