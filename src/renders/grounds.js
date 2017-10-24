import {
  World,
  Bodies,
  Composites,
} from 'matter-js';
import COLLISION from './collision';

export default function ({ engine, size }) {
  // center of the ground
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

  const makeCenter = () => {
    const amount = Math.ceil(size.width / 3 / cellSize);
    const xx = (size.width / 3) - adjust;
    const yy = (size.height / 2) - adjust;
    const xxx = (size.width / 3);
    return [
      Composites.stack(xx, yy, amount, 1, 0, 0, (x, y) =>
        Bodies.rectangle(x, y, cellSize, cellSize, spriteOptions)),
      Bodies.rectangle(xxx + (xxx / 2), yy + adjust, amount * cellSize, cellSize, options),
    ];
  };
  const makeSmall = (x, y, width) => {
    const amount = Math.ceil(size.width / width / cellSize);
    const xx = x - (size.width / (width * 2)) - adjust;
    const yy = y - adjust;
    const xxx = (x - (size.width / (width * 2))) + ((amount * adjust) - adjust);
    return [
      Composites.stack(xx, yy, amount, 1, 0, 0, (_x, _y) =>
        Bodies.rectangle(_x, _y, cellSize, cellSize, spriteOptions)),
      Bodies.rectangle(xxx, yy + adjust, amount * cellSize, cellSize, options),
    ];
  };
  const grounds = [
    ...makeCenter(),
    ...makeSmall(size.width / 6, size.height / 4, 6),
    ...makeSmall(size.width / 6, (size.height / 4) * 3, 6),
    ...makeSmall((size.width / 6) * 5, size.height / 4, 6),
    ...makeSmall((size.width / 6) * 5, (size.height / 4) * 3, 6),
    ...makeSmall(size.width / 2, size.height / 6, 10),
    ...makeSmall(size.width / 2, (size.height / 6) * 5, 10),
  ];

  World.add(engine.world, grounds);
  return grounds;
}
