import {
  World,
  Bodies,
  Composites,
} from 'matter-js';
import COLLISION from './collision';

export default function ({ engine, size, stage = 'hexagon' }) {
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
      fillStyle: 'transparent',
      lineWidth: 0,
    },
  };

  const make = (x, y, amount) => {
    const groundWidth = amount * cellSize;
    const xx = x - (width / (groundWidth * 2)) - adjust;
    const yy = y - adjust;
    const xxx = (x - (width / (groundWidth * 2))) + ((amount * adjust) - adjust);
    return [
      Composites.stack(xx, yy, amount, 1, 0, 0, (_x, _y) =>
        Bodies.rectangle(_x, _y, cellSize, cellSize, spriteOptions)),
      Bodies.rectangle(xxx, yy + adjust, amount * cellSize, cellSize, options),
    ];
  };

  const grounds = {
    pentagon: () =>
      [
        ...make(width / 3, (height / 5) * 4, Math.ceil(width / 2 / cellSize)),
        ...make(width / 6, height / 2, 6),
        ...make((width / 6) * 5, height / 2, 6),
      ],
    hexagon: () =>
      [
        ...make(width / 3, height / 2, Math.ceil(width / 3 / cellSize)),
        ...make(width / 6, height / 4, 6),
        ...make(width / 6, (height / 4) * 3, 6),
        ...make((width / 6) * 5, height / 4, 6),
        ...make((width / 6) * 5, (height / 4) * 3, 6),
        ...make(width / 2, height / 6, 10),
        ...make(width / 2, (height / 6) * 5, 10),
      ],
  }[stage]();

  World.add(engine.world, grounds);
  return grounds;
}
