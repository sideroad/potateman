/* eslint-disable no-console */
import Express from 'express';
import compression from 'compression';
import path from 'path';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Server as WebSocketServer } from 'ws';

const app = new Express();

app.use(compression());
app.use(Express.static(path.join(__dirname, '../dist/static'), {
  maxAge: '1d',
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const server = new http.Server(app);
const wss = new WebSocketServer({ server });

const send = (ws, from, data) => {
  const json = JSON.stringify(data);
  ws.send(json);
  console.log(`from:${from} to:${ws.id} data:${json}`);
};

const colors = [
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
];

const act = {
  stage: {},
  player: {},
  started: {},
  init: (ws, from, data) => {
    act.stage[from] = [];
    send(ws, from, {
      act: data.act,
      stage: from,
    });
  },
  start: (ws, from, data) => {
    act.started[from] = true;
    send(ws, from, data);
  },
  attend: (ws, from, data) => {
    const attend = {
      act: data.act,
      stage: data.stage,
      player: from,
      color: colors[from],
    };
    if (
      act.stage[data.stage] &&
      !act.started[data.stage]
    ) {
      act.stage[data.stage].push(from);
      act.player[from] = data.stage;
      send(ws, from, attend);
    }
  },
  jp: (ws, from, data) => {
    send(ws, act.player[from], data);
  },
};

const clients = [];
const broadcast = (msg, from) => {
  clients.forEach((ws) => {
    if (
      ws.id === null
    ) {
      return;
    }
    if (act[msg.act]) {
      act[msg.act](ws, from, msg);
    } else {
      send(ws, from, msg);
    }
  });
};
let connectionId = 0;

wss.on('connection', (ws) => {
  console.log(`connected! id:${connectionId}`);
  // eslint-disable-next-line no-param-reassign
  ws.id = connectionId;
  clients.push(ws);
  connectionId += 1;

  ws.addListener('message', (message) => {
    const msg = JSON.parse(message);
    broadcast(msg, ws.id);
  });
  ws.addListener('close', () => {
    console.log(`connection closed. id:${ws.id}`);
    // eslint-disable-next-line no-param-reassign
    ws.id = null;
  });
});
server.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    console.error(err);
  }
});
