import 'babel-polyfill';
import QRious from 'qrious';

const act = {
  attend: ({ color }) => {
    const attendee = document.getElementById('attendee');
    const div = document.createElement('div');
    div.setAttribute('class', 'attendee-container');
    div.innerHTML = `
      <div class="attendee-caret" style="border-color: ${color} transparent;"></div>
      <img class="attendee-character" src="/images/potateman-stand-left-1.png"/>
    `;
    attendee.appendChild(div);
  },
  start: () => {
    document.getElementById('winner').style.display = 'none';
    if (document.getElementById('qr-container')) {
      document.getElementById('qr-container').remove();
    }
  },
  win: (data) => {
    document.getElementById('winner-caret').style.borderColor = `${data.color} transparent`;
    document.getElementById('winner-character').style.backgroundImage = `url(${data.image})`;
    document.getElementById('winner').style.display = 'block';
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
