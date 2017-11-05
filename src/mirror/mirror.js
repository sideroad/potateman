import 'babel-polyfill';
import QRious from 'qrious';
import attendee from '../dom/attendee';
import start from '../dom/start';
import win from '../dom/win';

const act = {
  attend: ({ color }) => {
    attendee({ color });
  },
  start: () => {
    start();
  },
  win: (data) => {
    win(data);
  },
};
const stage = window.location.pathname.match(/\/mirror\/([^/]+)\//)[1];
const url = `http://${window.location.host}/joypad/${stage}/`;
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
peer.on('open', (id) => {
  const conn = peer.connect(stage, {
    serialization: 'json',
  });
  const call = peer.call(stage, document.getElementById('dummy').captureStream());
  console.log(id, stage);
  conn.on('data', (data) => {
    if (act[data.act]) {
      act[data.act](data);
    }
  });
  call.on('stream', (stream) => {
    const streamElem = document.getElementById('stream');
    streamElem.srcObject = stream;
    streamElem.play();
  });
  call.on('error', (msg) => {
    console.log(msg);
  });
});
peer.on('error', (err) => {
  console.log(err);
});
