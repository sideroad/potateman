/* eslint-disable no-param-reassign */
import MAGIC from '../magic';

export default function easyFn({
  player,
  others,
  size,
}) {
  const target = others
    .map((other) => {
      const distance = {
        x: player.body.position.x - other.body.position.x,
        y: player.body.position.y - other.body.position.y,
      };
      return {
        ...other,
        distance: {
          ...distance,
          xabs: Math.abs(distance.x),
          yabs: Math.abs(distance.y),
          t: Math.abs(distance.x) + Math.abs(distance.y),
        },
      };
    })
    .sort((a, b) => a.distance.t > b.distance.t)[0];

  player.direction.right =
    (
      target.distance.x < 0 &&
      (size.width / 4) * 3 > player.body.position.x
    ) ||
    size.width / 4 > player.body.position.x ? 1 : 0;

  player.direction.left =
    (
      target.distance.x > 0 &&
      size.width / 4 < player.body.position.x
    ) ||
    (size.width / 4) * 3 < player.body.position.x ? 1 : 0;

  player.direction.up =
    (
      (
        target.distance.y > 0 &&
        size.height / 4 < player.body.position.y
      ) ||
      (size.height / 4) * 3 < player.body.position.y
    ) &&
    !player.direction.up ? 1 : 0;

  player.direction.down =
    target.distance.y < 0 &&
    (size.height / 4) * 3 > player.body.position.y ? 1 : 0;

  player.direction.b =
    target.distance.y < 0 &&
    !target.body.attr.flying ? 1 : 0;

  if (target.body.attr.punchGage < 20) {
    player.direction.a = 1;
  } else {
    player.direction.a = 0;
  }

  if (
    target.distance.xabs < 5 &&
    target.distance.y < 0 &&
    target.body.attr.magic > MAGIC.uppercut.min
  ) {
    player.direction.down = 1;
    player.direction.c = 1;
  }

  if (
    target.distance.xabs < 5 &&
    target.distance.y > 0 &&
    target.body.attr.magic > MAGIC.uppercut.min
  ) {
    player.direction.up = 1;
    player.direction.c = 1;
  }
  if (
    target.distance.yabs < 5 &&
    target.body.attr.magic > MAGIC.uppercut.min
  ) {
    player.direction.c = 1;
  }
  if (
    target.body.attr.magic > MAGIC.volcano.min
  ) {
    player.direction.up = 0;
    player.direction.down = 0;
    player.direction.left = 0;
    player.direction.right = 0;
    player.direction.a = 0;
    player.direction.b = 0;
    player.direction.c = 0;
  }
}
