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
          const t = e.originalEvent.touches[0];
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

      $(window).bind('keyup keypress', (e) => {
        const code = e.keyCode;
        const keyMap = {
          100: 0,
          119: 2,
          97: 4,
          122: 6,
        };

        elem.trigger('joypad', {
          ang: keyMap[code],
          a: (code === 102 ? 1 : 0),
          b: (code === 103 ? 1 : 0),
        });
      });
    });
  };
})(window.jQuery);
