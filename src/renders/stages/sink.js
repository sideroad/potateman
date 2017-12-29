import {
  World,
  Bodies,
} from 'matter-js';
import random from '../../helpers/random';
import COLLISION from '../collision';

export default function sinkFn({
  width,
  height,
  cellSize,
  makeGround,
  makeWall,
  engine,
  adjust,
}) {
  return {
    background: '#C1E4E9',
    textures: {
      ground: '/images/sink-ground.png',
      wall: '/images/sink-wall.png',
    },
    restitution: 0,
    friction: 0,
    shape: textures =>
      [
        ...makeGround({
          x: width / 6,
          y: (height / 4) + adjust,
          amount: Math.ceil(width / 6 / cellSize),
          textures,
        }),
        ...makeGround({
          x: (width / 6) * 5,
          y: (height / 4) + adjust,
          amount: Math.ceil(width / 6 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 2,
          y: height / 2,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 3,
          y: (height / 4) * 3,
          amount: Math.ceil(width / 6 / cellSize),
          textures,
        }),
        ...makeGround({
          x: (width / 3) * 2,
          y: (height / 4) * 3,
          amount: Math.ceil(width / 6 / cellSize),
          textures,
        }),
        ...makeWall({
          x: (width / 10) - (adjust / 2),
          y: -height / 4,
          amount: Math.ceil(height / cellSize),
          textures,
          thick: 2,
        }),
        ...makeWall({
          x: ((width / 10) * 9) + (adjust / 2),
          y: -height / 4,
          amount: Math.ceil(height / cellSize),
          textures,
          thick: 2,
        }),
        ...makeWall({
          x: width / 4,
          y: (height / 2) + (adjust / 2),
          amount: Math.ceil(height / 2 / cellSize),
          textures,
          thick: 2,
        }),
        ...makeWall({
          x: (width / 4) * 3,
          y: (height / 2) + (adjust / 2),
          amount: Math.ceil(height / 2 / cellSize),
          textures,
          thick: 2,
        }),
        ...makeWall({
          x: ((width / 12) * 7) + (adjust * 2),
          y: (height * 1.25) + (adjust),
          amount: Math.ceil(height / cellSize),
          textures,
          thick: 2,
        }),
        ...makeWall({
          x: ((width / 12) * 5) - (adjust * 2),
          y: (height * 1.25) + (adjust),
          amount: Math.ceil(height / cellSize),
          textures,
          thick: 2,
        }),
      ],
    count: 151,
    setup: () => {},
    beforeUpdate: (count) => {
      if (count % 1000 < 150) {
        const x = random(0, width / 6) + ((width / 12) * 5);
        const water = Bodies.rectangle(x, -height, 2, 75, {
          render: {
            strokeStyle: '#ffffff',
            fillStyle: '#89C3EB',
            opacity: 0.8,
          },
          collisionFilter: {
            category: COLLISION.ITEM,
            // eslint-disable-next-line no-bitwise
            mask: COLLISION.POTATEMANS,
          },
          isSensor: true,
        });
        water.attr = {
          type: 'water',
        };
        World.add(engine.world, [water]);
      }
    },
  };
}
