import {
  World,
  Bodies,
  Composites,
} from 'matter-js';
import queryString from 'query-string';
import COLLISION from './collision';
import random from '../helpers/random';

const params = queryString.parse(window.location.search);

export default function ({ engine, size }) {
  const { width, height } = size;
  // background
  World.add(engine.world, Bodies.rectangle(width / 2, height / 2, width, height, {
    render: {
      fillStyle: '#F1F4FE',
    },
    isStatic: true,
    collisionFilter: {
      category: COLLISION.DEFAULT,
    },
  }));

  const cellSize = 20;
  const adjust = cellSize / 2;
  const spriteOptions = {
    isSensor: true,
    isStatic: true,
    render: {
      sprite: {
        texture: '/images/ground.png',
      },
    },
  };
  const options = {
    density: 1,
    isStatic: true,
    collisionFilter: {
      category: COLLISION.GROUND,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.POTATEMANS | COLLISION.ITEM,
    },
    render: {
      // fillStyle: 'transparent',
      lineWidth: 0,
    },
  };

  const make = (x, y, amount) => {
    const groundWidth = amount * cellSize;
    const xx = x - (groundWidth / 2);
    const yy = y;
    return [
      Composites.stack(xx, yy - adjust, amount, 1, 0, 0, (_x, _y) =>
        Bodies.rectangle(_x, _y, cellSize, cellSize, spriteOptions)),
      Bodies.rectangle(x, y, groundWidth, cellSize, options),
    ];
  };
  const maps = {
    ice: () =>
      [
        ...make(width / 2, (height / 5) * 4, Math.ceil(width / 1.5 / cellSize)),
        ...make(width / 4, height / 2, 10),
        ...make((width / 4) * 3, height / 2, 10),
        ...make(width / 2, (height / 5) * 1.5, 10),
      ],
    space: () =>
      [
        ...make(width / 2, height / 2, Math.ceil(width / 2 / cellSize)),
        ...make(width / 6, height / 4, 6),
        ...make(width / 6, (height / 4) * 3, 6),
        ...make((width / 6) * 5, height / 4, 6),
        ...make((width / 6) * 5, (height / 4) * 3, 6),
        ...make(width / 2, height / 6, 10),
        ...make(width / 2, (height / 6) * 5, 10),
      ],
    earth: () =>
      [
        ...make(width / 2, (height / 4) * 3, Math.ceil(width / 2 / cellSize)),
        ...make(width / 4, height / 2, Math.ceil(width / 5 / cellSize)),
        ...make((width / 4) * 3, height / 2, Math.ceil(width / 5 / cellSize)),
        ...make(width / 8, height / 4, Math.ceil(width / 5 / cellSize)),
        ...make((width / 8) * 7, height / 4, Math.ceil(width / 5 / cellSize)),
      ],
    volcano: () =>
      [
        ...make(width / 2, (height / 6) * 5, Math.ceil(width / 1.5 / cellSize)),
        ...make(width / 2, (height / 6) * 3, Math.ceil(width / 3 / cellSize)),
        ...make(width / 2, (height / 6), Math.ceil(width / 6 / cellSize)),
      ],
  };
  const stages = Object.keys(maps);
  const stageIndex = random(0, stages.length - 1);
  const grounds = maps[params.stage || stages[stageIndex]]();
  grounds.forEach((ground) => {
    // eslint-disable-next-line no-param-reassign
    ground.attr = {
      ground: true,
    };
  });

  World.add(engine.world, grounds);
  return grounds;
}
