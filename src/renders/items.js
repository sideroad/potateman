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
    mask: COLLISION.POTATEMANS | COLLISION.GROUND | COLLISION.WALL | COLLISION.ATTACK,
  };
  Events.on(engine, 'beforeUpdate', () => {
    count += 1;

    if (count % 300 === 0) {
      const dice = random(0, 100);
      const x = random(size.width / 4, (size.width / 4) * 3);
      if (dice < 40) {
        const rescueBox = Bodies.rectangle(x, 0, 20, 20, {
          collisionFilter,
          restitution: 1,
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
          item: true,
        };
        World.add(engine.world, [rescueBox]);
      } else if (dice < 70) {
        const magicBox = Bodies.rectangle(x, 0, 20, 20, {
          collisionFilter,
          restitution: 1,
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
          item: true,
        };
        World.add(engine.world, [magicBox]);
      } else if (dice < 90) {
        const flamethrower = Bodies.rectangle(x, 0, 20, 10, {
          collisionFilter,
          restitution: 1,
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
          item: true,
        };
        World.add(engine.world, [flamethrower]);
      } else if (dice <= 100) {
        const giant = Bodies.rectangle(x, 0, 20, 20, {
          collisionFilter,
          restitution: 1,
          render: {
            sprite: {
              texture: '/images/giant-leaf.png',
              xScale: 0.5,
              yScale: 0.5,
            },
          },
        });
        giant.attr = {
          type: 'giant',
          item: true,
        };
        World.add(engine.world, [giant]);
      }
    }
  });
}
