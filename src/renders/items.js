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
  Events.on(engine, 'beforeUpdate', () => {
    const collisionFilter = {
      category: COLLISION.ITEM,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.POTATEMANS | COLLISION.GROUND,
    };
    count += 1;

    if (count % 1000 === 0) {
      const rescueBox = Bodies.rectangle(random(0, size.width), 0, 20, 20, {
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
    if (count % 1500 === 0) {
      const magicBox = Bodies.rectangle(random(0, size.width), 0, 20, 20, {
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
  });
}
