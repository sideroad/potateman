/* eslint-disable no-param-reassign */

import {
  Events,
  Body,
  World,
  // Bounds,
} from 'matter-js';
import queryString from 'query-string';

const params = queryString.parse(window.location.search);
const boundaryLimit = Number(params.boundaryLimit || 1);
const maxMagnify = Number(params.maxMagnify || 2);
const minMagnify = Number(params.minMagnify || 0.25);
const magnify = params.magnify !== 'false';

export default function ({
  engine,
  size,
  act,
  players,
  render,
}) {
  let count = 0;
  Events.on(engine, 'beforeUpdate', () => {
    const bottomBoundary = size.height * 2;
    const topBoundary = size.height * -1;
    const maxX = render.bounds.max.x;
    const maxY = render.bounds.max.y;
    const minX = render.bounds.min.x;
    const minY = render.bounds.min.y;
    Object
      .values(players)
      .forEach((player) => {
        const { position, attr } = player.body;
        Body.set(attr.outsiderRight, {
          render: {
            ...attr.outsiderRight.render,
            opacity: position.x > maxX ? 1 : 0,
          },
        });
        Body.set(attr.outsiderLeft, {
          render: {
            ...attr.outsiderLeft.render,
            opacity: position.x < minX ? 1 : 0,
          },
        });
        Body.set(attr.outsiderTop, {
          render: {
            ...attr.outsiderTop.render,
            opacity: position.y < minY ? 1 : 0,
          },
        });
        Body.set(attr.outsiderBottom, {
          render: {
            ...attr.outsiderBottom.render,
            opacity: position.y > maxY ? 1 : 0,
          },
        });
        if (
          position.y > bottomBoundary ||
          position.y < topBoundary
        ) {
          const lastAttacker = players[attr.lastAttacked];
          if (lastAttacker) {
            lastAttacker.body.attr.damage = lastAttacker.body.attr.damage > attr.damage ?
              lastAttacker.body.attr.damage - attr.damage : 0;
            lastAttacker.body.attr.magic += attr.magic;
            lastAttacker.body.attr.score += attr.damage + attr.magic + attr.score;
          }
          act.dead({
            act: 'dead',
            player: player.body.attr.player,
            score: Math.ceil(attr.score),
          });
        }
      });
    if (count % 5 === 0) {
      engine.world.bodies.forEach((body) => {
        if (body.position.y > bottomBoundary) {
          World.remove(engine.world, body);
        }
      });
    }
    count += 1;
  });

  if (magnify) {
    const half = {
      width: size.width / 2,
      height: size.height / 2,
    };
    const min = {
      width: size.width * minMagnify,
      height: size.height * minMagnify,
    };
    const max = {
      width: size.width * maxMagnify,
      height: size.height * maxMagnify,
    };
    let prev = {
      min: {
        x: render.bounds.min.x,
        y: render.bounds.min.y,
      },
      max: {
        x: render.bounds.max.x,
        y: render.bounds.max.y,
      },
    };

    Events.on(engine, 'beforeTick', () => {
      const leftTop = {
        x: half.width,
        y: half.height,
      };
      const rightBottom = {
        x: half.width,
        y: half.height,
      };
      Object
        .values(players)
        .forEach((player) => {
          const { x, y } = player.body.position;
          if (x < leftTop.x && x > 0) {
            leftTop.x = x;
          }
          if (y < leftTop.y && y > 0) {
            leftTop.y = y;
          }
          if (x > rightBottom.x && x < size.width) {
            rightBottom.x = x;
          }
          if (y > rightBottom.y && y < size.height) {
            rightBottom.y = y;
          }
        });
      const center = {
        x: ((rightBottom.x - leftTop.x) / 2) + leftTop.x,
        y: ((rightBottom.y - leftTop.y) / 2) + leftTop.y,
      };
      const width = rightBottom.x - leftTop.x;
      const height = rightBottom.y - leftTop.y;
      const bounds = {
        width: width < min.width ? min.width : width > max.width ? max.width : width,
        height: height < min.height ? min.height : height > max.height ? max.height : height,
      };
      const calc = {
        x: (center.x - prev.x) / 2,
        y: (center.y - prev.y) / 2,
        width: (bounds.width - prev.width) / 2,
        height: (bounds.height - prev.height) / 2,
      };
      const rounded = {
        x: calc.x > boundaryLimit ? prev.x + boundaryLimit :
        calc.x < -boundaryLimit ? prev.x - boundaryLimit : center.x,
        y: calc.y > boundaryLimit ? prev.y + boundaryLimit :
        calc.y < -boundaryLimit ? prev.y - boundaryLimit : center.y,
        width: calc.width > boundaryLimit ? prev.width + boundaryLimit :
        calc.width < -boundaryLimit ? prev.width - boundaryLimit : bounds.width,
        height: calc.height > boundaryLimit ? prev.height + boundaryLimit :
        calc.height < -boundaryLimit ? prev.height - boundaryLimit : bounds.height,
      };
      const ratio = size.width / size.height;

      if (ratio <= rounded.width / rounded.height) {
        rounded.min = {
          x: (rounded.x - (rounded.width / 2)) - rounded.width,
          y: rounded.y - (((rounded.width * 3) / ratio) / 2),
        };
        rounded.max = {
          x: (rounded.x + (rounded.width / 2)) + rounded.width,
          y: rounded.y + (((rounded.width * 3) / ratio) / 2),
        };
      } else {
        rounded.min = {
          x: rounded.x - (((rounded.height * 3) * ratio) / 2),
          y: (rounded.y - (rounded.height / 2)) - rounded.height,
        };
        rounded.max = {
          x: rounded.x + (((rounded.height * 3) * ratio) / 2),
          y: (rounded.y + (rounded.height / 2)) + rounded.height,
        };
      }
      render.bounds = rounded;
      prev = rounded;
    });
  }
}
