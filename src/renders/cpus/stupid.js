/* eslint-disable no-param-reassign */

export default function easyFn({
  player,
  others,
  size,
  items,
  // grounds,
}) {
  const target = others
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

  player.direction.b =
    target.distance.y < 0 &&
    !player.body.attr.flying ? 1 : 0;
}
