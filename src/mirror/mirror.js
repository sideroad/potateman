import 'babel-polyfill';
import QRious from 'qrious';
import attendee from '../dom/attendee';
import start from '../dom/start';
import win from '../dom/win';
import ranking from '../dom/ranking';

const act = {
  attend: ({ stack, data: { image } }) => {
    attendee({ stack, image });
  },
  mirror: ({ data: { stack } }) => {
    stack.forEach(data => act.attend({ stack, data }));
  },
  start: () => {
    start();
  },
  win: (data) => {
    win(data);
  },
};
const stage = window.location.pathname.match(/\/mirror\/([^/]+)\//)[1];
const url = `${window.location.protocol}//${window.location.host}/joypad/${stage}/`;
// eslint-disable-next-line no-new
new QRious({
  element: document.getElementById('qr'),
  value: url,
});
const peer = new window.Peer({
  host: window.location.hostname,
  port: window.location.port,
  path: '/peerjs',
});
setInterval(() => {
  peer.socket.send({
    type: 'KEEPALIVE',
  });
}, 5000);
peer.on('open', () => {
  const conn = peer.connect(stage, {
    serialization: 'json',
  });
  const call = peer.call(stage, document.getElementById('dummy').captureStream());
  conn.on('data', (data) => {
    if (act[data.act]) {
      act[data.act](data);
    }
  });
  conn.on('open', () => {
    conn.send({
      act: 'mirror',
    });
  });
  call.on('stream', (stream) => {
    const streamElem = document.getElementById('stream');
    streamElem.srcObject = stream;
    streamElem.play();
  });
  call.on('error', (msg) => {
    // eslint-disable-next-line no-console
    console.log(msg);
  });
});
peer.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.log(err);
});

fetch('https://chaus.herokuapp.com/apis/potateman/scores?orderBy=-score')
  .then(res => res.json())
  .then(res => ranking(res));
