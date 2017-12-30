import {
  Body,
} from 'matter-js';
import _ from 'lodash';
import COLLISION from '../collision';
import random from '../../helpers/random';
import cure from '../motions/cure';

export default function mossFn({
  width,
  height,
  cellSize,
  makeGround,
  engine,
}) {
  return {
    background: '#f7ffea',
    textures: {
      ground: '/images/moss-ground.png',
    },
    restitution: 0,
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
          x: width / 4,
          y: (height / 5) * 3,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: (width / 4) * 3,
          y: (height / 5) * 3,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 3,
          y: (height / 5) * 2,
          amount: Math.ceil(width / 6 / cellSize),
          textures,
        }),
        ...makeGround({
          x: (width / 3) * 2,
          y: (height / 5) * 2,
          amount: Math.ceil(width / 6 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 2,
          y: (height / 5),
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 2,
          y: (height / 5),
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
      ],
    setup: () => {},
    beforeUpdate: (count, grounds) => {
      grounds.forEach((ground, index) => {
        // does not apply base ground
        if (index < 2) {
          return;
        }
        const direction = index % 4 < 2 ? 0.5 : -0.5;
        const amplify = Math.ceil((index + 1) / 2);
        const px = Math.cos(count / 50) * direction * amplify * (width / 500);
        if (ground.bodies) {
          ground.bodies.forEach((body) => {
            Body.setPosition(body, { x: px + body.position.x, y: body.position.y });
          });
        } else {
          Body.setPosition(ground, { x: px + ground.position.x, y: ground.position.y });
        }
      });
      if (count % 1500 === 0) {
        _.times((width / 200) * (height / 200), () => {
          const x = random(0, width);
          const y = random(0, height);
          cure({
            engine,
            body: {
              attr: {
                category: COLLISION.NONE,
              },
              position: { x, y },
            },
          });
        });
        engine.world.bodies
          .forEach((body) => {
            if (body.attr && body.attr.type === 'potateman') {
              const increase = (count / 1500) * 25;
              // eslint-disable-next-line no-param-reassign
              body.attr.magic += increase;
              // eslint-disable-next-line no-param-reassign
              body.attr.power += increase;
            }
          });
      }
    },
  };
}
