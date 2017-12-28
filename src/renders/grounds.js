import {
  World,
  Body,
  Bodies,
  Composites,
  Events,
} from 'matter-js';
import queryString from 'query-string';
import _ from 'lodash';
import COLLISION from './collision';
import random from '../helpers/random';
import volcano from './commands/volcano';
import giant from './commands/giant';
import cure from './motions/cure';

const params = queryString.parse(window.location.search);

export default function ({ engine, size }) {
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
    amount,
    textures,
  }) => {
    const groundWidth = amount * cellSize;
    const xx = x - (groundWidth / 2);
    const yy = y;
    spriteOptions.render.sprite.texture = textures.ground;
    return [
      Composites.stack(xx, yy - adjust, amount, 1, 0, 0, (_x, _y) =>
        Bodies.rectangle(_x, _y, cellSize, cellSize, spriteOptions)),
      Bodies.rectangle(x, y, groundWidth, cellSize, groundOptions),
    ];
  };
  const makeWall = ({
    x,
    y,
    thick = 2,
    amount,
    textures,
  }) => {
    const groundHeight = amount * cellSize;
    const xx = x;
    const yy = y - (groundHeight / 2);
    spriteOptions.render.sprite.texture = textures.wall;
    return [
      Composites.stack(xx - (adjust * thick), yy, thick, amount, 0, 0, (_x, _y) =>
        Bodies.rectangle(_x, _y, cellSize, cellSize, spriteOptions)),
      Bodies.rectangle(x, y, cellSize * thick, groundHeight, wallOptions),
    ];
  };
  let count = 0;
  // eslint-disable-next-line no-param-reassign
  engine.world.gravity.x = 0;
  // eslint-disable-next-line no-param-reassign
  engine.world.gravity.y = 1;
  const maps = {
    ice: {
      background: '#ffffff',
      textures: {
        ground: '/images/ice-ground.png',
      },
      restitution: 0,
      friction: 0,
      hasItem: true,
      shape: textures =>
        [
          // eslint-disable-next-line max-len
          ...makeGround({
            x: width / 2,
            y: (height / 5) * 4,
            amount: Math.ceil(width / 1.5 / cellSize),
            textures,
          }),
          ...makeGround({
            x: width / 4,
            y: height / 2,
            amount: 10,
            textures,
          }),
          ...makeGround({
            x: (width / 4) * 3,
            y: height / 2,
            amount: 10,
            textures,
          }),
          ...makeGround({
            x: width / 2,
            y: (height / 5) * 1.5,
            amount: 10,
            textures,
          }),
        ],
      setup: () => {
        // skip first wind
        count = 50;
      },
      beforeUpdate: () => {
        if (count % 20 === 0) {
          const body = Bodies.circle(random(0, size.width), 0, 3, {
            frictionAir: 0.15,
            density: 0.0001,
            render: {
              strokeStyle: '#ccdddd',
              fillStyle: '#bbdddd',
              opacity: 1,
            },
            isSensor: true,
          });
          body.attr = {
            snow: true,
          };
          World.add(engine.world, [body]);
        }
        if (count % 500 < 50) {
          const x = count % 1000 < 50 ? 0.25 : -0.25;
          engine.world.bodies
            .filter(body =>
              (body.attr && body.attr.type === 'potateman'))
            .forEach((body) => {
              Body.setVelocity(body, {
                x: body.velocity.x + x,
                y: body.velocity.y,
              });
            });
          engine.world.bodies
            .filter(body =>
              (body.attr && body.attr.item) ||
              (body.attr && body.attr.snow))
            .forEach((body) => {
              if (body.position.y > height) {
                World.remove(engine.world, body);
              } else {
                Body.setVelocity(body, {
                  x: body.velocity.x + (x * 2),
                  y: body.velocity.y,
                });
              }
            });
        }
      },
    },
    space: {
      background: '#0D0015',
      textures: {
        ground: '/images/space-ground.png',
      },
      restitution: 0,
      friction: 15,
      hasItem: true,
      shape: textures =>
        [
          ...makeGround({
            x: width / 2,
            y: height / 2,
            amount: Math.ceil(width / 2 / cellSize),
            textures,
          }),
          ...makeGround({
            x: width / 6,
            y: height / 4,
            amount: 6,
            textures,
          }),
          ...makeGround({
            x: width / 6,
            y: (height / 4) * 3,
            amount: 6,
            textures,
          }),
          ...makeGround({
            x: (width / 6) * 5,
            y: height / 4,
            amount: 6,
            textures,
          }),
          ...makeGround({
            x: (width / 6) * 5,
            y: (height / 4) * 3,
            amount: 6,
            textures,
          }),
          ...makeGround({
            x: width / 2,
            y: height / 6,
            amount: 10,
            textures,
          }),
          ...makeGround({
            x: width / 2,
            y: (height / 6) * 5,
            amount: 10,
            textures,
          }),
        ],
      setup: () => {
        _.times((width / 60) * (height / 60), (index) => {
          const starSize = index % 10 ? 0.5 : 0.75;
          const x = random(width * -0.5, width * 1.5);
          const y = random(height * -0.5, height * 1.5);
          World.add(engine.world, [
            Bodies.circle(x, y, starSize, {
              render: {
                strokeStyle: index % 2 ? '#eeffff' : '#ccffff',
                fillStyle: index % 2 ? '#eeffff' : '#ccffff',
                opacity: 1,
              },
              isStatic: true,
              isSensor: true,
            }),
          ]);
        });
      },
      beforeUpdate: () => {
        if (count % 1000 < 200) {
          World.add(engine.world, [
            Bodies.rectangle(random(0, width), 0, 1, 75, {
              render: {
                strokeStyle: '#ffffff',
                fillStyle: '#ffffff',
                opacity: 0.5,
              },
              isSensor: true,
            }),
          ]);
          if (count % 1000 > 50) {
            // eslint-disable-next-line no-param-reassign
            engine.world.gravity.y = 2;
          }
        } else if (count % 1000 === 200) {
          // eslint-disable-next-line no-param-reassign
          engine.world.gravity.y = 1;
        }
      },
    },
    earth: {
      background: '#F1F4FE',
      textures: {
        ground: '/images/ground.png',
        wall: '/images/ground.png',
      },
      restitution: 0,
      friction: 15,
      hasItem: false,
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
      setup: () => {
        // skip first flamethrowers
        count = 1;
      },
      beforeUpdate: () => {
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
    },
    brick: {
      background: '#fff2b2',
      textures: {
        ground: '/images/brick-ground.png',
      },
      restitution: 0,
      friction: 15,
      hasItem: true,
      shape: textures =>
        [
          ...makeGround({
            x: width / 2,
            y: height / 2,
            amount: Math.ceil(width / 1.25 / cellSize),
            textures,
          }),
          ...makeGround({
            x: width / 5,
            y: height / 5,
            amount: Math.ceil(width / 5 / cellSize),
            textures,
          }),
          ...makeGround({
            x: width / 3,
            y: (height / 5) * 4,
            amount: Math.ceil(width / 5 / cellSize),
            textures,
          }),
          ...makeGround({
            x: (width / 5) * 4,
            y: height / 5,
            amount: Math.ceil(width / 5 / cellSize),
            textures,
          }),
          ...makeGround({
            x: (width / 3) * 2,
            y: (height / 5) * 4,
            amount: Math.ceil(width / 5 / cellSize),
            textures,
          }),
        ],
      setup: () => {
        // skip first become titan
        count = 1;
      },
      beforeUpdate: () => {
        if (count % 1500 === 0) {
          engine.world.bodies
            .forEach((body) => {
              if (body.attr && body.attr.type === 'potateman') {
                giant({
                  engine,
                  size,
                  body,
                });
              }
            });
        }
      },
    },
    candy: {
      background: '#fdb8bd',
      textures: {
        ground: '/images/candy-ground.png',
      },
      restitution: 1,
      friction: 15,
      hasItem: true,
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
      beforeUpdate: (grounds) => {
        grounds.forEach((ground, index) => {
          // does not apply base grounds
          if (index < 2) {
            return;
          }
          const direction = index % 4 < 2 ? 0.5 : -0.5;
          const amplify = 2;
          const px = Math.cos(count / 50) * direction * amplify * (size.height / 500);
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
              restitution: 1,
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
    },
    moss: {
      background: '#f7ffea',
      textures: {
        ground: '/images/moss-ground.png',
      },
      restitution: 0,
      friction: 15,
      hasItem: true,
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
      beforeUpdate: (grounds) => {
        grounds.forEach((ground, index) => {
          // does not apply base ground
          if (index < 2) {
            return;
          }
          const direction = index % 4 < 2 ? 0.5 : -0.5;
          const amplify = Math.ceil((index + 1) / 2);
          const px = Math.cos(count / 50) * direction * amplify * (size.width / 500);
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
                  category: COLLISION.POTATEMANS,
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
    },
    volcano: {
      background: '#ffead8',
      textures: {
        ground: '/images/volcano-ground.png',
      },
      restitution: 0,
      friction: 15,
      hasItem: true,
      shape: textures =>
        [
          // eslint-disable-next-line max-len
          ...makeGround({
            x: width / 2,
            y: (height / 6) * 5,
            amount: Math.ceil(width / 1.5 / cellSize),
            textures,
          }),
          ...makeGround({
            x: width / 2,
            y: (height / 6) * 3,
            amount: Math.ceil(width / 3 / cellSize),
            textures,
          }),
          ...makeGround({
            x: width / 2,
            y: (height / 6),
            amount: Math.ceil(width / 6 / cellSize),
            textures,
          }),
        ],
      setup: () => {
        // skip first volcano
        count = 1;
      },
      beforeUpdate: () => {
        if (count % 100 === 0) {
          engine.world.bodies
            .forEach((body) => {
              if (body.attr && body.attr.type === 'potateman') {
                const increase = 10;
                // eslint-disable-next-line no-param-reassign
                body.attr.damage += increase;
              }
            });
        }
        if (count % 1000 === 0) {
          const volcanoOptions = {
            engine,
            size,
          };
          volcano({
            ...volcanoOptions,
            sprite: {
              direction: 'left',
            },
            body: {
              attr: {
                magic: 50,
                player: '',
                category: COLLISION.NONE,
              },
            },
          });
          volcano({
            ...volcanoOptions,
            sprite: {
              direction: 'right',
            },
            body: {
              attr: {
                magic: 50,
                player: '',
                category: COLLISION.NONE,
              },
            },
          });
        }
      },
    },
    nest: {
      background: '#F1F4FE',
      textures: {
        ground: '/images/ground.png',
        wall: '/images/wall.png',
      },
      restitution: 0,
      friction: 15,
      hasItem: false,
      shape: textures =>
        [
          ...makeGround({
            x: width / 4,
            y: height / 4,
            amount: Math.ceil(width / 4 / cellSize),
            textures,
          }),
          ...makeGround({
            x: (width / 4) * 3,
            y: height / 4,
            amount: Math.ceil(width / 4 / cellSize),
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
            x: ((width / 12) * 7) + (adjust * 2),
            y: height + (adjust * 1.5),
            amount: Math.ceil(height / 2 / cellSize),
            textures,
          }),
          ...makeWall({
            x: ((width / 12) * 5) - (adjust * 2),
            y: height + (adjust * 1.5),
            amount: Math.ceil(height / 2 / cellSize),
            textures,
          }),
          ...makeWall({
            x: width / 4,
            y: (height / 2) + (adjust / 2),
            amount: Math.ceil(height / 2 / cellSize),
            textures,
          }),
          ...makeWall({
            x: (width / 4) * 3,
            y: (height / 2) + (adjust / 2),
            amount: Math.ceil(height / 2 / cellSize),
            textures,
          }),
        ],
      setup: () => {
      },
      beforeUpdate: () => {
      },
    },
  };

  const stages = Object.keys(maps);
  const stageIndex = random(0, stages.length - 1);
  const stage = params.stage || stages[stageIndex];

  // background
  World.add(engine.world, Bodies.rectangle(width / 2, height / 2, width * 3, height * 3, {
    render: {
      fillStyle: maps[stage].background,
    },
    isStatic: true,
    collisionFilter: {
      category: COLLISION.DEFAULT,
    },
  }));

  const grounds = maps[stage].shape(maps[stage].textures);
  World.add(engine.world, grounds);

  const { setup, beforeUpdate } = maps[stage];
  setup();
  Events.on(engine, 'beforeUpdate', () => {
    beforeUpdate(grounds);
    count += 1;
  });
  return {
    friction: maps[stage].friction,
    restitution: maps[stage].restitution,
    hasItem: maps[stage].hasItem,
    grounds: grounds
      .filter(ground =>
        ground.type === 'body' &&
        ground.collisionFilter.category === COLLISION.GROUND),
  };
}
