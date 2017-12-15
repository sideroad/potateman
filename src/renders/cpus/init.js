import queryString from 'query-string';
import stupid from './stupid';
import easy from './easy';

const params = queryString.parse(window.location.search);

const cpu = {
  stupid,
  easy,
}[params.cpu || 'easy'];

let intervals = [];
export default function ({ players, size, world }) {
  Object
    .values(players)
    .filter(player => player.cpu)
    .forEach((player) => {
      const others = Object
        .values(players)
        .filter(_player => _player.body.attr.player !== player.body.attr.player);

      intervals.push(setInterval(() => {
        cpu({
          player,
          others,
          size,
          world,
          items: world.bodies.filter(body => body.attr && body.attr.item),
          grounds: world.bodies.filter(body => body.attr && body.attr.ground),
        });
      }, 200));
    });
}

export function destroy() {
  intervals.forEach(interval => clearInterval(interval));
  intervals = [];
}
