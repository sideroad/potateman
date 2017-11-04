import {
  World,
  Events,
  Body,
  Bodies,
} from 'matter-js';
import { getPunchStrength, shockWaveRender } from '../potateman';
import COLLISION from '../collision';

export default function punch({
  engine,
  body,
  sprite,
  direction,
}) {
  const { x = 0, y = 0 } = body.position;
  const { category } = body.attr;

  if (body.attr.sinkMotion) {
    World.remove(engine.world, body.attr.sinkMotion);
    // eslint-disable-next-line no-param-reassign
    body.attr.sinkMotion = undefined;
    sprite.setState('punch');
  }
  const strength = getPunchStrength(body.attr);
  // eslint-disable-next-line no-nested-ternary
  const speed = strength < 15 ? 15 : strength > 20 ? 20 : strength;
  const velocity = {
    x:
    direction.left ? speed * -1 :
    direction.right ? speed * 1 :
    !direction.down && !direction.up && sprite.direction === 'left' ? speed * -1 :
    !direction.down && !direction.up && sprite.direction === 'right' ? speed * 1 :
    0,
    y:
    !direction.left && !direction.right && direction.up ? speed * -1 :
    !direction.left && !direction.right && direction.down ? speed * 1 :
    0,
  };
  const shockWave = Bodies.circle(x, y, strength, {
    render: shockWaveRender,
    density: 0.025,
    collisionFilter: {
      category: COLLISION.ATTACK,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.POTATEMANS - category,
    },
    velocity,
  });
  World.add(engine.world, [
    shockWave,
  ]);
  shockWave.attr = {
    strength,
    type: 'shockWave',
    player: body.attr.player,
  };
  // eslint-disable-next-line no-param-reassign
  body.attr.punchGage = 0;

  Events.on(engine, 'beforeUpdate', () => {
    Body.setVelocity(shockWave, velocity);
    const scale = shockWave.attr.strength / strength;
    Body.scale(shockWave, scale, scale);
    shockWave.attr.strength -= 1;
    if (!shockWave.attr.strength) {
      World.remove(engine.world, shockWave);
    }
  });
}
