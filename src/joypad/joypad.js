import 'babel-polyfill';
import './jquery.joypad';
import auth from './auth';

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
          $('#color').css({
            borderColor: [msg.color, 'transparent', 'transparent', 'transparent'].join(' '),
          });
          let prev;
          const bind = () => {
            $('#joypad').joypad().bind('joypad', (e, param) => {
              const { ran } = param.ck;
              if (ran && ran < 50) return;

              const data = {
                act: 'jp',
                ang: param.ck.ang,
                a: param.a,
                b: param.b,
                c: param.c,
                // eslint-disable-next-line
                player: player,
                t: new Date().valueOf(),
              };
              if (JSON.stringify(data) === prev) return;
              prev = JSON.stringify(data);
              conn.send(data);
              $('#test').text(prev);
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
            user,
          });
        });
        conn.on('data', (data) => {
          if (act[data.act]) {
            act[data.act](data);
          }
        });
        conn.on('error', (msg) => {
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
        console.log(err);
      });
    });
  })(window.jQuery);
});
