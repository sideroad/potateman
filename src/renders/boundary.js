import {
  Events,
  Body,
  World,
} from 'matter-js';

export default function ({
  engine,
  size,
  act,
  players,
}) {
  Events.on(engine, 'beforeUpdate', () => {
    const bottomBoundary = size.height * 2;
    const topBoundary = size.height * -2;
    Object.keys(players).forEach((player) => {
      const { position, attr } = players[player].body;
      Body.set(attr.outsiderRight, {
        render: {
          ...attr.outsiderRight.render,
          opacity: position.x > size.width ? 1 : 0,
        },
      });
      Body.set(attr.outsiderLeft, {
        render: {
          ...attr.outsiderLeft.render,
          opacity: position.x < 0 ? 1 : 0,
        },
      });
      Body.set(attr.outsiderTop, {
        render: {
          ...attr.outsiderTop.render,
          opacity: position.y < 0 ? 1 : 0,
        },
      });
      Body.set(attr.outsiderBottom, {
        render: {
          ...attr.outsiderBottom.render,
          opacity: position.y > size.height ? 1 : 0,
        },
      });
      if (
        position.y > bottomBoundary ||
        position.y < topBoundary
      ) {
        act.dead({
          act: 'dead',
          player,
        });
      }
    });
    engine.world.bodies.forEach((body) => {
      if (body.position.y > bottomBoundary) {
        World.remove(engine.world, body);
      }
    });
  });
}
