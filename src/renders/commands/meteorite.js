import {
  World,
  Events,
  Body,
  Bodies,
} from 'matter-js';
import { getMeteoriteStrength } from '../potateman';
import COLLISION from '../collision';

export default function meteorite({
  engine,
  body,
  sprite,
  size,
}) {
  if (body.attr.magic < 2) {
    return;
  }
  const { x = 0, y = 0 } = body.position;
  const { category } = body.attr;

  sprite.setState('punch');
  const strength = getMeteoriteStrength(body.attr);
  const radius = 20 + (strength / 10);
  const meteoriteMotion = Bodies.circle(x, y, radius, {
    density: 0.1,
    frictionAir: 0,
    render: {
      sprite: {
        texture: '/images/meteorite.png',
        xScale: 1 + (strength / 200),
        yScale: 1 + (strength / 200),
      },
    },
    collisionFilter: {
      category: COLLISION.ATTACK,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.POTATEMANS - category,
    },
    force: {
      x: sprite.direction === 'left' ? -5 - (strength / 5) : 5 + (strength / 5),
      y: -1 - (strength / 40),
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

  Events.on(engine, 'beforeUpdate', () => {
    if (!meteoriteMotion.position.y > size.height * 2) {
      World.remove(engine.world, meteoriteMotion);
    }
  });
}
