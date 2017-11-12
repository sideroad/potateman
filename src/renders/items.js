import {
  World,
  Events,
  Bodies,
} from 'matter-js';
import random from '../helpers/random';
import COLLISION from './collision';

export default function itemsFn({
  engine,
  size,
}) {
  let count = 0;
  const collisionFilter = {
    category: COLLISION.ITEM,
    // eslint-disable-next-line no-bitwise
    mask: COLLISION.POTATEMANS | COLLISION.GROUND | COLLISION.ATTACK,
  };
  Events.on(engine, 'beforeUpdate', () => {
    count += 1;

    if (count % 500 === 0) {
      const x = random(size.width / 4, (size.width / 4) * 3);
      const rescueBox = Bodies.rectangle(x, 0, 20, 20, {
        collisionFilter,
        render: {
          sprite: {
            texture: '/images/rescue-box.png',
            xScale: 0.5,
            yScale: 0.5,
          },
        },
      });
      rescueBox.attr = {
        type: 'rescueBox',
      };
      World.add(engine.world, [rescueBox]);
    }
    if (count % 750 === 0) {
      const x = random(size.width / 4, (size.width / 4) * 3);
      const magicBox = Bodies.rectangle(x, 0, 20, 20, {
        collisionFilter,
        render: {
          sprite: {
            texture: '/images/magic-box.png',
            xScale: 0.5,
            yScale: 0.5,
          },
        },
      });
      magicBox.attr = {
        type: 'magicBox',
      };
      World.add(engine.world, [magicBox]);
    }
    if (count % 1000 === 0) {
      const x = random(size.width / 4, (size.width / 4) * 3);
      const flamethrower = Bodies.rectangle(x, 0, 20, 10, {
        collisionFilter,
        render: {
          sprite: {
            texture: '/images/flamethrower-equip-left-1.png',
            xScale: 0.5,
            yScale: 0.5,
          },
        },
      });
      flamethrower.attr = {
        type: 'flamethrower',
      };
      World.add(engine.world, [flamethrower]);
    }
  });
}
