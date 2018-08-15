import 'babel-polyfill';
import jsQR from "jsqr";
import auth from '../helpers/auth';
import loading from '../dom/loading';
import expander from '../dom/expander';
import joypad from '../dom/joypad';
import login from '../dom/login';

window.alert(screen.availHeight + ':' + screen.height + ':' + window.innerHeight);

auth('', (user) => {
  const loginsElem = document.getElementById('logins');
  if (loginsElem) {
    loginsElem.remove();
  }
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
          window.scrollTo(0, 1);
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
        });
      };

      peer.on('open', (_player) => {
        const stage = (window.location.pathname.match(/\/joypad\/([^/]+)\//)||[])[1];
        if (stage) {
          input(stage, _player);
        } else {
          // eslint-disable-next-line
          input(window.prompt('Please read QR code to join'), _player);
        }
      });
      peer.on('error', (err) => {
        // eslint-disable-next-line no-console
      });
    });
  })(window.jQuery);
}, () => {
  login();
});
