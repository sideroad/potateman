import {
  World,
  Body,
  Bodies,
} from 'matter-js';
import { getMeteoriteStrength } from '../potateman';
import COLLISION from '../collision';
import MAGIC from '../magic';

export default function meteorite({
  engine,
  body,
  sprite,
}) {
  if (body.attr.magic < MAGIC.meteorite.min) {
    return;
  }
  const { x = 0, y = 0 } = body.position;
  const { category } = body.attr;

  sprite.setState('punch');
  const strength = getMeteoriteStrength(body.attr);
  const radius = 20 + (strength / 5);
  const meteoriteMotion = Bodies.circle(x, y, radius, {
    density: 0.1,
    frictionAir: 0,
    render: {
      sprite: {
        texture: MAGIC.meteorite.image,
        xScale: 1 + (strength / 100),
        yScale: 1 + (strength / 100),
      },
    },
    collisionFilter: {
      category: COLLISION.ATTACK,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.POTATEMANS - category,
    },
    force: {
      x: sprite.direction === 'left' ? -1 * radius * (radius < 30 ? 0.5 : 1) : radius * (radius < 30 ? 0.5 : 1),
      y: (-1 * radius) / 8,
    },
  });
  Body.setAngularVelocity(meteoriteMotion, sprite.direction === 'left' ? -0.4 : 0.4);
  World.add(engine.world, [
    meteoriteMotion,
  ]);
  meteoriteMotion.attr = {
    strength,
    type: 'meteorite',
    player: body.attr.player,
  };
  // eslint-disable-next-line no-param-reassign
  body.attr.magic = 1;
}
