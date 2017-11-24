import { stringify } from '../helpers/input';

export default function bindJoypadFn(callback) {
  let prev;
  (($) => {
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
      callback(data);
    });
  })(window.jQuery);
}
