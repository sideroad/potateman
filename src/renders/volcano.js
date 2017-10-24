import {
  World,
  Events,
  Bodies,
} from 'matter-js';
import _ from 'lodash';
import COLLISION from './collision';

export default function ({ engine, size }) {
  const explosion = () => {
    const volcanos = [];
    _.times(0, () => {
      volcanos.push(Bodies.rectangle(size.width / 2, size.height, 20, 20, {
        friction: 0,
        render: {
          sprite: {
            texture: '/images/ground.png',
          },
        },
        force: {
          x: (Math.random() / 25) * (Math.random() > 0.5 ? 1 : -1),
          y: -0.04,
        },
        collisionFilter: {
          category: COLLISION.GROUND,
          mask: COLLISION.POTATEMANS,
        },
      }));
    });

    World.add(engine.world, volcanos);
  };

  let counter = 0;
  Events.on(engine, 'afterUpdate', () => {
    counter += 1;
    // every 1.5 sec
    if (counter >= 60 * 1.5) {
      explosion(engine);

      // reset counter
      counter = 0;
    }
  });
}
