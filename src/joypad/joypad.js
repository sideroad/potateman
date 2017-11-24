import 'babel-polyfill';
import auth from '../helpers/auth';
import loading from '../dom/loading';
import expander from '../dom/expander';
import joypad from '../dom/joypad';

document.getElementById('expander-icon').addEventListener('touchend', () => {
  expander.end();
  document.documentElement.webkitRequestFullscreen();
});

auth((user) => {
  (($) => {
    $(() => {
      let conn;
      let player;

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

      const act = {
        attend: ({ data }) => {
          if (player) {
            return;
          }
          // eslint-disable-next-line
          player = data.player;
          $('#image').css({
            backgroundImage: `url(${data.image})`,
          });
          window.addEventListener('orientationchange', () => {
            joypad.destroy();
            joypad.binder(commands => conn.send(commands));
          });
          window.addEventListener('resize', () => {
            joypad.destroy();
            joypad.binder(commands => conn.send(commands));
          });
          joypad.binder(commands => conn.send(commands));
        },
      };

      const input = (stage, _player) => {
        conn = peer.connect(stage, {
          serialization: 'json',
        });
        conn.on('open', () => {
          conn.send({
            act: 'attend',
            // eslint-disable-next-line
            stage: stage,
            // eslint-disable-next-line
            player: _player,
            fbid: user.id,
            name: user.name,
            image: user.image,
          });
          loading.end();
          const ua = window.navigator.userAgent;
          if (!/iPhone/.test(ua)) {
            expander.start();
          }
        });
        conn.on('data', (data) => {
          if (act[data.act]) {
            act[data.act](data);
          }
        });
        conn.on('error', (msg) => {
          // eslint-disable-next-line no-console
          console.log(msg);
        });
      };

      peer.on('open', (_player) => {
        const stage = window.location.pathname.match(/\/joypad\/([^/]+)\//)[1];
        if (stage) {
          input(stage, _player);
        } else {
          // eslint-disable-next-line
          window.alert('Please read QR code to join');
        }

        const streamElem = document.getElementById('stream');
        document.getElementById('portable').addEventListener('click', () => {
          document.getElementById('joypad').className = 'joypad portable-mode';
          $('#joypad').joypad('destroy');
          joypad.bind();
          const call = peer.call(stage, document.getElementById('dummy').captureStream());
          call.on('stream', (stream) => {
            streamElem.srcObject = stream;
            streamElem.play();
          });
          call.on('error', (msg) => {
            // eslint-disable-next-line no-console
            console.log(msg);
          });
          streamElem.play();
        });
      });
      peer.on('error', (err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
    });
  })(window.jQuery);
});
