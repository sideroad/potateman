import COLLISION from '../collision';
import random from '../../helpers/random';
import cure from '../motions/cure';

export default function hellFn({
  width,
  height,
  cellSize,
  makeGround,
  makeWall,
  engine,
  // adjust,
}) {
  return {
    background: '#310001',
    textures: {
      ground: '/images/hell-ground.png',
      wall: '/images/hell-wall.png',
    },
    restitution: 0,
    friction: 15,
    shape: textures =>
      [
        ...makeGround({
          x: width / 2,
          y: (height / 3) * 2,
          amount: Math.ceil(width / 3 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 4,
          y: height / 2,
          amount: Math.ceil(width / 6 / cellSize),
          textures,
        }),
        ...makeGround({
          x: (width / 4) * 3,
          y: height / 2,
          amount: Math.ceil(width / 6 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 2,
          y: 0,
          amount: Math.ceil(width / cellSize),
          textures,
          thick: 2,
          tunnel: false,
          lava: true,
        }),
        ...makeGround({
          x: width / 2,
          y: height,
          amount: Math.ceil(width / cellSize),
          textures,
          thick: 2,
          tunnel: false,
          lava: true,
        }),
        ...makeWall({
          x: 0,
          y: height / 2,
          amount: Math.ceil(height / cellSize),
          textures,
          thick: 2,
          lava: true,
        }),
        ...makeWall({
          x: width,
          y: height / 2,
          amount: Math.ceil(height / cellSize),
          textures,
          thick: 2,
          lava: true,
        }),
      ],
    setup: () => {},
    beforeUpdate: (count) => {
      if (count % 20 === 0) {
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
          strength: 25,
          strokeStyle: '#b02c2c',
          fillStyle: '#b02c2c',
          velocity: {
            x: 0,
            y: -10,
          },
        });
      }
      if (count % 100 === 0) {
        engine.world.bodies
          .forEach((body) => {
            if (body.attr && body.attr.type === 'potateman') {
              const increase = 5;
              // eslint-disable-next-line no-param-reassign
              body.attr.damage += increase;
            }
          });
      }
    },
  };
}
