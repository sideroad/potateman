import 'babel-polyfill';
import './jquery.joypad';
import auth from './auth';
import loading from '../dom/loading';
import expander from '../dom/expander';
import { stringify } from '../helpers/input';

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
        attend: (msg) => {
          if (player) {
            return;
          }
          // eslint-disable-next-line
          player = msg.player;
          $('#image').css({
            backgroundImage: `url(${msg.image})`,
          });
          let prev;
          const bind = () => {
            $('#joypad').joypad().bind('joypad', (e, param) => {
              const { ran } = param.ck;
              if (ran && ran < 50) return;
              const i = stringify({
                ang: param.ck.ang,
                a: param.a,
                b: param.b,
                c: param.c,
              });
              const data = {
                act: 'jp',
                i,
              };
              if (i === prev) return;
              prev = i;
              conn.send(data);
            });
          };
          window.addEventListener('orientationchange', () => {
            $('#joypad').joypad('destroy');
            bind();
          });
          window.addEventListener('resize', () => {
            $('#joypad').joypad('destroy');
            bind();
          });
          bind();
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
      });
      peer.on('error', (err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
    });
  })(window.jQuery);
});
