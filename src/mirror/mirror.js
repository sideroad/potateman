import 'babel-polyfill';
import QRious from 'qrious';

const act = {
  start: () => {
    if (document.getElementById('qr-container')) {
      document.getElementById('qr-container').remove();
    }
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
peer.on('open', (id) => {
  const conn = peer.connect(stage);
  const call = peer.call(stage, document.getElementById('dummy').captureStream(25));
  console.log(id, stage);
  conn.on('data', (data) => {
    if (act[data.act]) {
      act[data.act](data);
    }
  });
  call.on('stream', (stream) => {
    document.getElementById('stream').srcObject = stream;
  });
  call.on('error', (msg) => {
    console.log(msg);
  });
});
peer.on('error', (err) => {
  console.log(err);
});
