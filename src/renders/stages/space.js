import {
  World,
  Bodies,
} from 'matter-js';
import _ from 'lodash';
import random from '../../helpers/random';

export default function spaceFn({
  width,
  height,
  cellSize,
  makeGround,
  engine,
}) {
  return {
    background: '#0D0015',
    textures: {
      ground: '/images/space-ground.png',
    },
    restitution: 0,
    friction: 15,
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
    beforeUpdate: (count) => {
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
  };
}
