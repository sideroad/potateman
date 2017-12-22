import queryString from 'query-string';
import stupid from './stupid';
import easy from './easy';

const params = queryString.parse(window.location.search);

const cpu = {
  stupid,
  easy,
}[params.cpu || 'easy'];

export default function ({ engine, players, size }) {
  Object
    .values(players)
    .filter(player => player.cpu)
    .forEach((player, index) => {
      const others = Object
        .values(players)
        .filter(_player => _player.body.attr.player !== player.body.attr.player);

      setTimeout(() => {
        cpu({
          player,
          others,
          size,
          engine,
        });
      }, index * 50);
    });
}
