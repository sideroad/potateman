import {
  World,
  Bodies,
  Events,
} from 'matter-js';
import COLLISION from './collision';

export default function ({
  engine,
  size,
  act,
}) {
  const options = {
    isStatic: true,
    collisionFilter: {
      category: COLLISION.BOUNDARY,
    },
  };
  const boundaries = [
    Bodies.rectangle(0 - size.width, 0 - size.height, size.width * 3, 100, options),
    Bodies.rectangle(0 - size.width, 0 - size.height, 100, size.height * 3, options),
    Bodies.rectangle(size.width * 2, 0 - size.height, 100, size.height * 3, options),
    Bodies.rectangle(size.width / 2, size.height * 2, size.width * 3, 100, options),
  ];
  World.add(engine.world, boundaries);

  Events.on(engine, 'collisionStart', (event) => {
    const { pairs } = event;
    for (let i = 0, j = pairs.length; i < j; i += 1) {
      const pair = pairs[i];
      if (boundaries.includes(pair.bodyA)) {
        if (pair.bodyB.attr && pair.bodyB.attr.type === 'potateman') {
          act.send({
            act: 'dead',
            player: pair.bodyB.attr.player,
          });
        }
      } else if (boundaries.includes(pair.bodyB)) {
        if (pair.bodyA.attr && pair.bodyA.attr.type === 'potateman') {
          act.send({
            act: 'dead',
            player: pair.bodyA.attr.player,
          });
        }
      }
    }
  });
}
