import {
  World,
  Bodies,
  Composites,
  Events,
} from 'matter-js';
import COLLISION from './collision';
import random from '../helpers/random';
import brick from './stages/brick';
import candy from './stages/candy';
import earth from './stages/earth';
import ice from './stages/ice';
import moss from './stages/moss';
import hell from './stages/hell';
import sink from './stages/sink';
import space from './stages/space';
import volcano from './stages/volcano';

const stages = {
  fight: {
    brick,
    candy,
    earth,
    ice,
    moss,
    hell,
    sink,
    space,
    volcano,
  },
};

export default function ({
  engine,
  size,
  type,
  selected,
}) {
  const { width, height } = size;
  const cellSize = 20;
  const adjust = cellSize / 2;
  const groundOptions = {
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
  const wallOptions = {
    density: 1,
    isStatic: true,
    collisionFilter: {
      category: COLLISION.WALL,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.POTATEMANS | COLLISION.ITEM,
    },
    render: {
      // fillStyle: 'transparent',
      lineWidth: 0,
    },
  };
  const spriteOptions = {
    isSensor: true,
    isStatic: true,
    render: {
      sprite: {
        texture: '/images/ground.png',
      },
    },
  };
  const makeGround = ({
    x,
    y,
    thick = 1,
    amount,
    textures,
    tunnel = true,
    lava = false,
  }) => {
    const groundWidth = amount * cellSize;
    const xx = x - (groundWidth / 2);
    const yy = y;
    spriteOptions.render.sprite.texture = lava ? textures.lava : textures.ground;
    const options = tunnel ? groundOptions : wallOptions;
    const ground = Bodies.rectangle(x, y, groundWidth, cellSize * thick, options);
    ground.attr = lava ?
      {
        type: 'lava',
        strength: 20,
      } : {
        type: 'ground',
      };
    return [
      Composites.stack(xx, yy - (adjust * thick), amount, thick, 0, 0, (_x, _y) =>
        Bodies.rectangle(_x, _y, cellSize, cellSize, spriteOptions)),
      ground,
    ];
  };
  const makeWall = ({
    x,
    y,
    thick = 1,
    amount,
    textures,
    lava = false,
  }) => {
    const groundHeight = amount * cellSize;
    const xx = x;
    const yy = y - (groundHeight / 2);
    spriteOptions.render.sprite.texture = lava ? textures.lava : textures.wall;
    const wall = Bodies.rectangle(x, y, cellSize * thick, groundHeight, wallOptions);
    wall.attr = lava ?
      {
        type: 'lava',
        strength: 20,
      } : {
        type: 'ground',
      };
    return [
      Composites.stack(xx - (adjust * thick), yy, thick, amount, 0, 0, (_x, _y) =>
        Bodies.rectangle(_x, _y, cellSize, cellSize, spriteOptions)),
      wall,
    ];
  };
  // eslint-disable-next-line no-param-reassign
  engine.world.gravity.x = 0;
  // eslint-disable-next-line no-param-reassign
  engine.world.gravity.y = 1;

  const stagesKey = Object.keys(stages[type]);
  const stageIndex = random(0, stagesKey.length - 1);
  const stageKey = selected || stagesKey[stageIndex];
  const stage = stages[type][stageKey]({
    width,
    height,
    cellSize,
    makeGround,
    makeWall,
    engine,
    adjust,
  });

  // background
  World.add(engine.world, Bodies.rectangle(width / 2, height / 2, width * 3, height * 3, {
    render: {
      fillStyle: stage.background,
    },
    isStatic: true,
    collisionFilter: {
      category: COLLISION.DEFAULT,
    },
  }));

  const grounds = stage.shape(stage.textures);
  World.add(engine.world, grounds);

  const { setup, beforeUpdate } = stage;
  let count = stage.count || 0;
  setup();
  Events.on(engine, 'beforeUpdate', () => {
    beforeUpdate(count, grounds);
    count += 1;
  });
  return {
    friction: stage.friction,
    restitution: stage.restitution,
    grounds: grounds
      .filter(ground =>
        ground.type === 'body' &&
        ground.attr &&
        ground.attr.type === 'ground'),
  };
}
