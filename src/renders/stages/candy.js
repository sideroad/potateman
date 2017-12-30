import {
  World,
  Body,
  Bodies,
} from 'matter-js';
import _ from 'lodash';
import random from '../../helpers/random';
import COLLISION from '../collision';

export default function candyFn({
  width,
  height,
  cellSize,
  makeGround,
  engine,
}) {
  return {
    background: '#fdb8bd',
    textures: {
      ground: '/images/candy-ground.png',
    },
    restitution: 1,
    friction: 15,
    shape: textures =>
      [
        ...makeGround({
          x: width / 2,
          y: (height / 5) * 4,
          amount: Math.ceil(width / 1.5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 5,
          y: height / 2,
          amount: Math.ceil(width / 4 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 2,
          y: height / 5,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: (width / 5) * 4,
          y: height / 2,
          amount: Math.ceil(width / 4 / cellSize),
          textures,
        }),
      ],
    setup: () => {},
    beforeUpdate: (count, grounds) => {
      grounds.forEach((ground, index) => {
        // does not apply base grounds
        if (index < 2) {
          return;
        }
        const direction = index % 4 < 2 ? 0.5 : -0.5;
        const amplify = 2;
        const px = Math.cos(count / 50) * direction * amplify * (height / 500);
        if (ground.bodies) {
          ground.bodies.forEach((body) => {
            Body.setPosition(body, { x: body.position.x, y: px + body.position.y });
          });
        } else {
          Body.setPosition(ground, { x: ground.position.x, y: px + ground.position.y });
        }
      });

      if (count % 1500 === 0) {
        _.times(width / 50, () => {
          const cream = Bodies.rectangle(random(0, width), 0, 20, 10, {
            collisionFilter: {
              category: COLLISION.ITEM,
              // eslint-disable-next-line no-bitwise
              mask: COLLISION.POTATEMANS |
                    COLLISION.GROUND |
                    COLLISION.WALL |
                    COLLISION.ATTACK,
            },
            restitution: 0,
            render: {
              sprite: {
                texture: '/images/cream.png',
              },
            },
          });
          cream.attr = {
            type: 'curse',
          };
          World.add(engine.world, [cream]);
        });
      }
    },
  };
}
