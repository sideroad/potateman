import stupid from './stupid';
import easy from './easy';

const cpu = {
  stupid,
  easy,
};

export default function ({ engine, players, size }) {
  Object
    .values(players)
    .filter(player => player.cpu)
    .forEach((player, index) => {
      const others = Object
        .values(players)
        .filter(_player => _player.body.attr.player !== player.body.attr.player);

      setTimeout(() => {
        cpu[window.config.training ? 'stupid' : 'easy']({
          player,
          others,
          size,
          engine,
        });
      }, index * 50);
    });
}
