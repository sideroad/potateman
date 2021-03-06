/* eslint-disable no-param-reassign */
import {
  Events,
} from 'matter-js';

export default function stupidFn({
  player,
  others,
  size,
  engine,
  // grounds,
}) {
  let count = 0;
  const { world } = engine;
  const tick = () => {
    const items = world.bodies.filter(body => body.attr && body.attr.item);
    if (count % 20 === 0) {
      const target = others
        .filter(other => !other.dead)
        .map(other => other.body)
        .concat(items)
        .map((other) => {
          const distance = {
            x: player.body.position.x - other.position.x,
            y: player.body.position.y - other.position.y,
          };
          const xabs = Math.abs(distance.x);
          const yabs = Math.abs(distance.y);
          return {
            ...other,
            distance: {
              ...distance,
              xabs,
              yabs,
              t: xabs + yabs,
            },
          };
        })
        .sort((a, b) => a.distance.t > b.distance.t)[0];

      if (!target) {
        player.direction.up = 0;
        player.direction.down = 0;
        player.direction.left = 0;
        player.direction.right = 0;
        player.direction.a = 0;
        player.direction.b = 0;
        player.direction.c = 0;
        return;
      }
      player.direction.c = 0;
      const quarterWidth = size.width / 4;
      const quarterHeight = size.height / 4;

      // teleport
      if (
        player.body.velocity.x < -15 &&
        player.body.attr.guardGage
      ) {
        player.direction.a = 0;
        player.direction.b = 1;
        player.direction.left = 0;
        player.direction.right = 1;
        player.direction.up = 0;
        player.direction.down = 0;
        return;
      }
      if (
        player.body.velocity.x > 15 &&
        player.body.attr.guardGage
      ) {
        player.direction.a = 0;
        player.direction.b = 1;
        player.direction.left = 1;
        player.direction.right = 0;
        player.direction.up = 0;
        player.direction.down = 0;
        return;
      }

      player.direction.right =
        (
          target.distance.x < 0 &&
          quarterWidth * 3 > player.body.position.x
        ) ||
        quarterWidth > player.body.position.x ? 1 : 0;

      player.direction.left =
        (
          target.distance.x > 0 &&
          quarterWidth < player.body.position.x
        ) ||
        quarterWidth * 3 < player.body.position.x ? 1 : 0;

      player.direction.up =
        (
          (
            target.distance.y > 0 &&
            quarterHeight < player.body.position.y
          ) ||
          quarterHeight * 3 < player.body.position.y
        ) &&
        !player.direction.up ? 1 : 0;

      player.direction.down =
        target.distance.y < 0 &&
        quarterHeight * 3 > player.body.position.y ? 1 : 0;


      // fall down / floating
      player.direction.b =
        target.distance.y < 0 &&
        !player.body.attr.flying ? 1 : 0;
    }
    count += 1;
    if (player.dead) {
      Events.off(engine, 'beforeUpdate', tick);
    }
  };

  Events.on(engine, 'beforeUpdate', tick);
}
