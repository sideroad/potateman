import 'babel-polyfill';
import jsQR from "jsqr";
import auth from '../helpers/auth';
import isFullscreen from '../helpers/detection';
import loading from '../dom/loading';
import joypad from '../dom/joypad';
import login from '../dom/login';
import readQR from '../dom/readQR';
import notifyToOpenFullscreen from '../dom/notifyToOpenFullscreen';

if (!isFullscreen()) {
  notifyToOpenFullscreen();
} else {
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

        const attend = ({ data }) => {
          if (player) {
            return;
          }
          // eslint-disable-next-line
          player = data.player;
          $('#image').css({
            backgroundImage: `url(${data.image})`,
          });
        };
        const act = {
        };

        const input = (stage, _player) => {
          conn = peer.connect(stage, {
            serialization: 'json',
          });
          conn.on('data', (data) => {
            if (act[data.act]) {
              act[data.act](data);
            }
          });
          conn.on('open', () => {
            const data = {
              act: 'attend',
              // eslint-disable-next-line
              stage: stage,
              // eslint-disable-next-line
              player: _player,
              fbid: user.id,
              name: user.name,
              image: user.image,
            };
            conn.send(data);
            attend({data});
            loading.end();
            window.scrollTo(0, 1);
            const ua = window.navigator.userAgent;
            window.addEventListener('orientationchange', () => {
              joypad.destroy();
              joypad.binder(commands => conn.send(commands));
            });
            window.addEventListener('resize', () => {
              joypad.destroy();
              joypad.binder(commands => conn.send(commands));
            });
            joypad.binder(commands => conn.send(commands));
          });
          conn.on('error', (msg) => {
            // eslint-disable-next-line no-console
          });
        };

        peer.on('open', (_player) => {
          // eslint-disable-next-line
          readQR((stage) => {
            input(stage, _player);
          })
        });
        peer.on('error', (err) => {
          // eslint-disable-next-line no-console
        });
      });
    })(window.jQuery);
  }, () => {
    login();
  });
}
