import '../joypad/jquery.joypad';
import { stringify } from '../helpers/input';

export default {
  binder: (callback) => {
    let prev;
    (($) => {
      $('#joypad').joypad().bind('joypad', (e, param) => {
        const { ran } = param.ck;
        if (ran && ran < 5) return;
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
        callback(data);
      });
    })(window.jQuery);
  },
  destroy: () => {
    (($) => {
      $('#joypad').joypad('destroy');
    })(window.jQuery);
  },
};
