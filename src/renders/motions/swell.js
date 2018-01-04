import {
  World,
  Events,
  Body,
  Bodies,
} from 'matter-js';
import COLLISION from '../collision';

export default function shrink({
  engine,
  type,
  strength,
  velocity,
  render,
  category,
  position,
  player,
  ratio = 1,
  initial = 1,
}) {
  const { x = 0, y = 0 } = position;

  const motion = Bodies.circle(x, y, initial, {
    render,
    density: 0.025,
    collisionFilter: {
      category: COLLISION.ATTACK,
      // eslint-disable-next-line no-bitwise
      mask: (COLLISION.POTATEMANS - category) | COLLISION.ITEM | COLLISION.ATTACK,
    },
    velocity,
  });
  World.add(engine.world, [
    motion,
  ]);
  motion.attr = {
    strength: initial,
    type,
    player,
  };
  const tick = () => {
    Body.setVelocity(motion, velocity);
    const scale = motion.attr.strength / motion.circleRadius;
    Body.scale(motion, scale, scale);
    motion.attr.strength += ratio;
    if (motion.attr.strength >= strength) {
      World.remove(engine.world, motion);
      Events.off(engine, 'beforeUpdate', tick);
    }
  };

  Events.on(engine, 'beforeUpdate', tick);
}
