/* eslint-disable no-console */
import Express from 'express';
import compression from 'compression';
import path from 'path';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { ExpressPeerServer } from 'peer';
import fs from 'fs';

const app = new Express();
const joypadHtml = fs.readFileSync(path.join(__dirname, '../dist/static/joypad/index.html'), 'utf8');
app.use(compression());
app.use(Express.static(path.join(__dirname, '../dist/static'), {
  maxAge: '1d',
}));
app.get('/joypad/:stage/', (req, res) => {
  res.send(joypadHtml);
});
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
