import 'babel-polyfill';
import QRious from 'qrious';
import auth from '../helpers/auth';
import attendee from '../dom/attendee';
import start from '../dom/start';
import win from '../dom/win';
import ranking from '../dom/ranking';
import loading from '../dom/loading';
import login from '../dom/login';
import joypad from '../dom/joypad';

login();
const initialize = () =>
  new Promise((resolve) => {
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
      }
    };
    const stage = window.location.pathname.match(/\/mirror\/([^/]+)\//)[1];
    // const url = `${window.location.protocol}//${window.location.host}/joypad/${stage}/`;
    // eslint-disable-next-line no-new
    new QRious({
      element: document.getElementById('qr'),
      value: stage
    });
    const peer = new window.Peer({
      host: window.location.hostname,
      port: window.location.port,
      path: '/peerjs'
    });
    setInterval(() => {
      peer.socket.send({
        type: 'KEEPALIVE'
      });
    }, 5000);
    peer.on('open', (player) => {
      const conn = peer.connect(
        stage,
        {
          serialization: 'json'
        }
      );
      const call = peer.call(stage, document.getElementById('dummy').captureStream());
      conn.on('data', (data) => {
        // eslint-disable-next-line no-console
        console.log('#data', data);
        if (act[data.act]) {
          act[data.act](data);
        }
      });
      conn.on('open', () => {
        // eslint-disable-next-line no-console
        console.log('#open');
        conn.send({
          act: 'mirror'
        });
        resolve({ data: { stage, player }, conn });
      });
      const streamElem = document.getElementById('stream');
      call.on('stream', (stream) => {
        // eslint-disable-next-line no-console
        console.log('#stream', stream);
        streamElem.srcObject = stream;
        streamElem.play();
      });
      call.on('error', (msg) => {
        // eslint-disable-next-line no-console
        console.error('#error', msg);
      });
    });
    peer.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.log(err);
    });

    fetch('https://chaus.herokuapp.com/apis/potateman/scores?orderBy=-score')
      .then(res => res.json())
      .then(res => ranking(res));
  });

auth(
  '',
  (user) => {
    loading.end();
    const loginsElem = document.getElementById('logins');
    if (loginsElem) {
      loginsElem.remove();
    }
    initialize().then(({ conn, data }) => {
      conn.send({
        act: 'attend',
        stage: data.stage,
        player: data.player,
        fbid: user.id,
        name: user.name,
        image: user.image
      });
      // window.addEventListener('orientationchange', () => {
      //   joypad.destroy();
      //   joypad.binder(commands => conn.send(commands));
      // });
      // window.addEventListener('resize', () => {
      //   joypad.destroy();
      //   joypad.binder(commands => conn.send(commands));
      // });
      // joypad.binder(commands => conn.send(commands));
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });
  },
  () => {
    initialize().catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    })
  }
);
