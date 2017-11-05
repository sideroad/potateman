(($) => {
  // eslint-disable-next-line no-param-reassign
  $.fn.joypad = function joypad(command) {
    if (command === 'destroy') {
      return this.each(function each() {
        const elem = $(this);
        elem.find('#ck').unbind();
        elem.find('.button').unbind();
        elem.unbind();
      });
    }
    return this.each(function each() {
      const elem = $(this);
      let ck = {};
      const event = {};

      // cross-key
      const crosskey = () => {
        const keyElem = elem.find('#ck');
        const w = keyElem.width();
        const h = keyElem.height();
        const pos = keyElem.position() || {};
        const { top, left } = pos;
        const centerX = left + (w / 2);
        const centerY = top + (h / 2);
        const id = keyElem.attr('id');

        ck = {
          width: w,
          height: h,
          top,
          left,
          bottom: top + h,
          right: left + w,
          centerX,
          centerY,
        };
        event[id] = 0;

        keyElem.bind('touchstart touchmove', (e) => {
          const t = Array.from(e.originalEvent.touches).find(touch => touch.target.id === 'ck');
          const { pageX, pageY } = t;
          const x = Math.round(((pageX - ck.centerX) / (ck.width / 2)) * 100);
          const y = Math.round(((pageY - ck.centerY) / (ck.height / 2)) * -100);
          let angle;
          let range;

          angle = (Math.atan2(y, x) / Math.PI) * 180;
          angle = Math.floor((((angle < 0) ? angle + 360 : angle) + 22.5) / 45);

          range = Math.sqrt((x ** 2) + (y ** 2));
          range = Math.round((range > 100) ? 100 : range);

          event[id] = {
            ang: (angle === 8) ? 0 : angle,
            ran: range,
          };
          elem.trigger('joypad', event);
        });

        keyElem.bind('touchend touchcancel', () => {
          event[id] = 0;
          elem.trigger('joypad', event);
        });
      };
      crosskey();

      // buttons
      elem.find('.button').each(function buttonEach() {
        const { id } = this;
        event[id] = 0;
        $(this).bind('touchstart', () => {
          event[id] = 1;
          elem.trigger('joypad', event);
        }).bind('touchmove', () => {
          event[id] = 1;
          elem.trigger('joypad', event);
        });

        $(this).bind('touchend touchcancel', () => {
          event[id] = 0;
          elem.trigger('joypad', event);
        });
      });

      $(document).bind('touchstart touchmove touchend', (e) => {
        e.preventDefault();
      });

      const keyMap = {
        38: 2, // up
        87: 2, // up
        37: 4, // left
        65: 4, // left
        39: 0, // right
        68: 0, // right
        40: 6, // bottom
        90: 6, // bottom
      };
      $(window).bind('keydown', (e) => {
        const code = e.keyCode;
        if (keyMap[code] !== undefined) {
          event.ck = {
            ang: keyMap[code],
            ran: 100,
          };
        }
        if (code === 70) {
          event.a = 1;
        }
        if (code === 71) {
          event.b = 1;
        }
        if (code === 72) {
          event.c = 1;
        }
        elem.trigger('joypad', event);
      });

      $(window).bind('keyup', (e) => {
        const code = e.keyCode;
        if (keyMap[code] !== undefined) {
          event.ck = 0;
        }
        if (code === 70) {
          event.a = 0;
        }
        if (code === 71) {
          event.b = 0;
        }
        if (code === 72) {
          event.c = 0;
        }
        elem.trigger('joypad', event);
      });
    });
  };
})(window.jQuery);

(($) => {
  $(() => {
    let conn;
    let player;

    const peer = new window.Peer({
      host: window.location.hostname,
      port: window.location.port,
      path: '/peerjs',
    });
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
