import {
  Events,
  Body,
} from 'matter-js';

export default function ({
  engine,
  size,
  act,
  players,
}) {
  Events.on(engine, 'beforeUpdate', () => {
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
        position.y > size.height * 3 ||
        position.y < size.height * -2
      ) {
        act.send({
          act: 'dead',
          player,
        });
      }
    });
  });
}
