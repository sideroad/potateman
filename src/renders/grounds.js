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

const params = queryString.parse(window.location.search);

export default function ({ engine, size }) {
  const { width, height } = size;
  const cellSize = 20;
  const adjust = cellSize / 2;
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
  const spriteOptions = {
    isSensor: true,
    isStatic: true,
    render: {
      sprite: {
        texture: '/images/ground.png',
      },
    },
  };
  const make = (x, y, amount, texture) => {
    const groundWidth = amount * cellSize;
    const xx = x - (groundWidth / 2);
    const yy = y;
    spriteOptions.render.sprite.texture = texture;
    return [
      Composites.stack(xx, yy - adjust, amount, 1, 0, 0, (_x, _y) =>
        Bodies.rectangle(_x, _y, cellSize, cellSize, spriteOptions)),
      Bodies.rectangle(x, y, groundWidth, cellSize, options),
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
      texture: '/images/ice-ground.png',
      friction: 0,
      shape: texture =>
        [
          // eslint-disable-next-line max-len
          ...make(width / 2, (height / 5) * 4, Math.ceil(width / 1.5 / cellSize), texture),
          ...make(width / 4, height / 2, 10, texture),
          ...make((width / 4) * 3, height / 2, 10, texture),
          ...make(width / 2, (height / 5) * 1.5, 10, texture),
        ],
      setup: () => {},
      beforeUpdate: () => {
        if (count % 20 === 0) {
          const body = Bodies.circle(random(0, size.width), 0, 3, {
            frictionAir: 0.2,
            render: {
              strokeStyle: '#ccdddd',
              fillStyle: '#ccdddd',
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
      texture: '/images/space-ground.png',
      friction: 15,
      shape: texture =>
        [
          ...make(width / 2, height / 2, Math.ceil(width / 2 / cellSize), texture),
          ...make(width / 6, height / 4, 6, texture),
          ...make(width / 6, (height / 4) * 3, 6, texture),
          ...make((width / 6) * 5, height / 4, 6, texture),
          ...make((width / 6) * 5, (height / 4) * 3, 6, texture),
          ...make(width / 2, height / 6, 10, texture),
          ...make(width / 2, (height / 6) * 5, 10, texture),
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
      texture: '/images/ground.png',
      friction: 15,
      shape: texture =>
        [
          ...make(width / 2, (height / 4) * 3, Math.ceil(width / 2 / cellSize), texture),
          ...make(width / 4, height / 2, Math.ceil(width / 5 / cellSize), texture),
          ...make((width / 4) * 3, height / 2, Math.ceil(width / 5 / cellSize), texture),
          ...make(width / 8, height / 4, Math.ceil(width / 5 / cellSize), texture),
          ...make((width / 8) * 7, height / 4, Math.ceil(width / 5 / cellSize), texture),
        ],
      setup: () => {},
      beforeUpdate: () => {},
    },
    forest: {
      background: '#f7ffea',
      texture: '/images/forest-ground.png',
      friction: 15,
      shape: texture =>
        [
          ...make(width / 2, (height / 5) * 4, Math.ceil(width / 2 / cellSize), texture),
          ...make(width / 4, (height / 5) * 3, Math.ceil(width / 5 / cellSize), texture),
          ...make((width / 4) * 3, (height / 5) * 3, Math.ceil(width / 5 / cellSize), texture),
          ...make(width / 3, (height / 5) * 2, Math.ceil(width / 6 / cellSize), texture),
          ...make((width / 3) * 2, (height / 5) * 2, Math.ceil(width / 6 / cellSize), texture),
          ...make(width / 2, (height / 5), Math.ceil(width / 5 / cellSize), texture),
          ...make(width / 2, (height / 5), Math.ceil(width / 5 / cellSize), texture),
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
      },
    },
    volcano: {
      background: '#ffead8',
      texture: '/images/volcano-ground.png',
      friction: 15,
      shape: texture =>
        [
          // eslint-disable-next-line max-len
          ...make(width / 2, (height / 6) * 5, Math.ceil(width / 1.5 / cellSize), texture),
          ...make(width / 2, (height / 6) * 3, Math.ceil(width / 3 / cellSize), texture),
          ...make(width / 2, (height / 6), Math.ceil(width / 6 / cellSize), texture),
        ],
      setup: () => {},
      beforeUpdate: () => {
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

  const grounds = maps[stage].shape(maps[stage].texture);
  grounds.forEach((ground) => {
    // eslint-disable-next-line no-param-reassign
    ground.attr = {
      ground: true,
    };
  });
  World.add(engine.world, grounds);

  const { setup, beforeUpdate } = maps[stage];
  setup();
  Events.on(engine, 'beforeUpdate', () => {
    beforeUpdate(grounds);
    count += 1;
  });
  return {
    friction: maps[stage].friction,
    grounds,
  };
}
