import {
  Events,
} from 'matter-js';
import MAGIC from '../magic';
import shrink from '../motions/shrink';

export default function uppercut({
  engine,
  body,
  sprite,
}) {
  if (body.attr.magic < MAGIC.uppercut.min) {
    return;
  }

  sprite.setState('punch');
  // eslint-disable-next-line no-nested-ternary
  const speed = 15;
  // eslint-disable-next-line no-param-reassign
  body.attr.magic -= 25;

  let count = 0;
  Events.on(engine, 'beforeUpdate', () => {
    if (count >= 15) {
      return;
    }
    count += 1;
    if (count % 2 === 0) {
      shrink({
        engine,
        body,
        strength: 17,
        type: 'shockWave',
        render: {
          strokeStyle: '#ffffff',
          fillStyle: count % 4 ? '#e9546b' : '#EB6238',
          opacity: 0.5,
          lineWidth: 1,
        },
        category: body.attr.category,
        player: body.attr.player,
        position: {
          x: body.position.x,
          y: body.position.y - 30,
        },
        velocity: {
          x: 0,
          y: speed,
        },
      });
    }
  });
}
