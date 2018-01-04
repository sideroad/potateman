import {
  Events,
} from 'matter-js';
import MAGIC from '../magic';
import shrink from '../motions/shrink';

function getUppercutStrength({ magic }) {
  const maticStrength = magic / 2;
  // eslint-disable-next-line no-nested-ternary
  const strength = maticStrength < 20 ? 20 :
  // eslint-disable-next-line indent
                   maticStrength > 300 ? 300 : maticStrength;
  return strength;
}

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
  body.attr.magic = 1;

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
        strength: getUppercutStrength({ magic: body.attr.magic }),
        type: 'shockWave',
        render: {
          strokeStyle: '#ffffff',
          fillStyle: count % 4 === 0 ? '#e9546b' : '#EB6238',
          opacity: 0.5,
          lineWidth: 1,
        },
        category: body.attr.category,
        player: body.attr.player,
        position: {
          x: body.position.x,
          y: body.position.y - 50,
        },
        velocity: {
          x: 0,
          y: speed,
        },
      });
    }
  });
}
