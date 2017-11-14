import cpu from './easy';

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
        });
      }, 200));
    });
}

export function destroy() {
  intervals.forEach(interval => clearInterval(interval));
  intervals = [];
}
