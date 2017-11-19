/* eslint-disable no-param-reassign */

import {
  Events,
  Body,
  World,
  // Bounds,
} from 'matter-js';

export default function ({
  engine,
  size,
  act,
  players,
  render,
}) {
  const ratio = size.width / size.height;
  Events.on(engine, 'beforeUpdate', () => {
    const bottomBoundary = size.height * 2;
    const topBoundary = size.height * -1;
    const maxX = render.bounds.max.x;
    const maxY = render.bounds.max.y;
    const minX = render.bounds.min.x;
    const minY = render.bounds.min.y;
    Object.keys(players).forEach((player) => {
      const { position, attr } = players[player].body;
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
          player,
          score: Math.ceil(attr.score),
        });
      }
    });
    engine.world.bodies.forEach((body) => {
      if (body.position.y > bottomBoundary) {
        World.remove(engine.world, body);
      }
    });
  });

  const half = {
    width: size.width / 2,
    height: size.height / 2,
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
    Object.values(players).forEach((player) => {
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

    const bounds = {
      width: rightBottom.x - leftTop.x,
      height: rightBottom.y - leftTop.y,
    };

    if (ratio <= bounds.width / bounds.height) {
      bounds.min = {
        x: leftTop.x - bounds.width,
        y: center.y - (((bounds.width * 3) / ratio) / 2),
      };
      bounds.max = {
        x: rightBottom.x + bounds.width,
        y: center.y + (((bounds.width * 3) / ratio) / 2),
      };
    } else {
      bounds.min = {
        x: center.x - (((bounds.height * 3) * ratio) / 2),
        y: leftTop.y - bounds.height,
      };
      bounds.max = {
        x: center.x + (((bounds.height * 3) * ratio) / 2),
        y: rightBottom.y + bounds.height,
      };
    }
    const calc = {
      min: {
        x: (bounds.min.x - prev.min.x) / 2,
        y: (bounds.min.y - prev.min.y) / 2,
      },
      max: {
        x: (bounds.max.x - prev.max.x) / 2,
        y: (bounds.max.y - prev.max.y) / 2,
      },
    };
    calc.move = {
      x: calc.max.x - calc.min.x,
      y: calc.max.y - calc.min.y,
    };
    const rounded = {
      min: {
        x: calc.min.x > 5 ? prev.min.x + 5 : calc.min.x < -5 ? prev.min.x - 5 : bounds.min.x,
        y: calc.min.y > 5 ? prev.min.y + 5 : calc.min.y < -5 ? prev.min.y - 5 : bounds.min.y,
      },
      max: {
        x: calc.max.x > 5 ? prev.max.x + 5 : calc.max.x < -5 ? prev.max.x - 5 : bounds.max.x,
        y: calc.max.y > 5 ? prev.max.y + 5 : calc.max.y < -5 ? prev.max.y - 5 : bounds.max.y,
      },
    };
    rounded.ratio = (rounded.max.x - rounded.min.x) / (rounded.max.y - rounded.min.y);
    // rounded.min.x -= ((ratio / calc.move.x) - (rounded.ratio / calc.move.x)) / 4;
    // rounded.max.x += ((ratio / calc.move.x) - (rounded.ratio / calc.move.x)) / 4;
    render.bounds = rounded;
    // render.bounds = bounds;
    prev = rounded;
  });
}
