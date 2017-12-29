import {
  World,
  Body,
  Bodies,
} from 'matter-js';
import random from '../../helpers/random';

export default function iceFn({
  width,
  height,
  cellSize,
  makeGround,
  engine,
}) {
  return {
    background: '#ffffff',
    textures: {
      ground: '/images/ice-ground.png',
    },
    restitution: 0,
    friction: 0,
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
    count: 50,
    setup: () => {},
    beforeUpdate: (count) => {
      if (count % 20 === 0) {
        const body = Bodies.circle(random(0, width), 0, 3, {
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
  };
}
