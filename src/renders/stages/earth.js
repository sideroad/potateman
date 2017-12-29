import _ from 'lodash';
import COLLISION from '../collision';
import cure from '../motions/cure';
import random from '../../helpers/random';

export default function earthFn({
  width,
  height,
  cellSize,
  makeGround,
  engine,
}) {
  return {
    background: '#F1F4FE',
    textures: {
      ground: '/images/ground.png',
    },
    restitution: 0,
    friction: 15,
    shape: textures =>
      [
        ...makeGround({
          x: width / 2,
          y: (height / 4) * 3,
          amount: Math.ceil(width / 2 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 4,
          y: height / 2,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: (width / 4) * 3,
          y: height / 2,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 8,
          y: height / 4,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: (width / 8) * 7,
          y: height / 4,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
      ],
    count: 1,
    setup: () => {},
    beforeUpdate: (count) => {
      if (count % 1500 === 0) {
        _.times((width / 200) * (height / 200), () => {
          const x = random(0, width);
          const y = random(0, height);
          cure({
            engine,
            body: {
              attr: {
                category: COLLISION.POTATEMANS,
              },
              position: { x, y },
            },
          });
        });
        engine.world.bodies
          .forEach((body) => {
            if (body.attr && body.attr.type === 'potateman') {
              // eslint-disable-next-line no-param-reassign
              body.attr.flamethrowers += 400;
            }
          });
      }
    },
  };
}
