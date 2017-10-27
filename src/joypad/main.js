(($) => {
  $(() => {
    let ws;

    const input = (stage) => {
      ws.send(JSON.stringify({
        act: 'attend',
        // eslint-disable-next-line
        stage: stage,
      }));
    };
    let player;
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

            const data = JSON.stringify({
              act: 'jp',
              ang: param.ck.ang,
              a: param.a,
              b: param.b,
              // eslint-disable-next-line
              player: player,
              t: new Date().valueOf(),
            });
            if (data === prev) return;
            prev = data;
            ws.send(data);
            $('#test').text(data);
          });
        };
        window.addEventListener('orientationchange', () => {
          $('#joypad').joypad('destroy');
          bind();
        });
        bind();
      },
      reinput: () => {
        input();
      },
    };

    (() => {
      const WebSocket = window.WebSocket || window.MozWebsocket;
      if (!WebSocket) {
        console.log('WebSocket is not defined');
        return;
      }

      ws = new WebSocket(`ws://${window.location.host}`);
      ws.onopen = () => {
        console.log('connected!');

        ws.onmessage = (msg) => {
          const data = JSON.parse(msg.data);
          console.log(data);
          if (act[data.act]) {
            act[data.act](data);
          }
        };

        const stage = window.location.hash.substr(1);
        if (stage) {
          input(stage);
        } else {
          // eslint-disable-next-line
          window.alert('Please read QR code to join');
        }
      };
      ws.onclose = () => {
        console.log('connection closed!');
      };
      window.addEventListener('hashchange', () => {
        const stage = window.location.hash.substr(1);
        if (stage) {
          input(stage);
        } else {
          // eslint-disable-next-line
          window.alert('Please read QR code to join');
        }
      });
    })();
  });
})(window.jQuery);
