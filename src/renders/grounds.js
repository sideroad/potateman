import {
  World,
  Bodies,
  Composites,
} from 'matter-js';
import COLLISION from './collision';
import random from '../helpers/random';

export default function ({ engine, size }) {
  const { width, height } = size;
  // background
  World.add(engine.world, Bodies.rectangle(width / 2, height / 2, width, height, {
    render: {
      fillStyle: '#F1F4FE',
    },
    isStatic: true,
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
      mask: COLLISION.POTATEMANS,
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
    pentagon: () =>
      [
        ...make(width / 2, (height / 5) * 4, Math.ceil(width / 1.5 / cellSize)),
        ...make(width / 4, height / 2, 10),
        ...make((width / 4) * 3, height / 2, 10),
        ...make(width / 2, (height / 5) * 1.5, 10),
      ],
    hexagon: () =>
      [
        ...make(width / 2, height / 2, Math.ceil(width / 2 / cellSize)),
        ...make(width / 6, height / 4, 6),
        ...make(width / 6, (height / 4) * 3, 6),
        ...make((width / 6) * 5, height / 4, 6),
        ...make((width / 6) * 5, (height / 4) * 3, 6),
        ...make(width / 2, height / 6, 10),
        ...make(width / 2, (height / 6) * 5, 10),
      ],
    triangle: () =>
      [
        ...make(width / 2, (height / 6) * 5, Math.ceil(width / 1.5 / cellSize)),
        ...make(width / 2, (height / 6) * 3, Math.ceil(width / 3 / cellSize)),
        ...make(width / 2, (height / 6), Math.ceil(width / 6 / cellSize)),
      ],
  };
  const stages = Object.keys(maps);
  const stageIndex = random(0, stages.length - 1);
  const grounds = maps[stages[stageIndex]]();

  World.add(engine.world, grounds);
  return grounds;
}
