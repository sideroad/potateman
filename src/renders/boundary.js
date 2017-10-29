import {
  Events,
} from 'matter-js';

export default function ({
  engine,
  size,
  act,
  players,
}) {
  Events.on(engine, 'beforeUpdate', () => {
    Object.keys(players).forEach((player) => {
      if (players[player].body.position.y > size.height * 2) {
        act.dead({
          player,
        });
      }
    });
  });
}
