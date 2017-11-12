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
}) {
  const { x = 0, y = 0 } = position;

  const motion = Bodies.circle(x, y, 1, {
    render,
    density: 0.025,
    collisionFilter: {
      category: COLLISION.ATTACK,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.POTATEMANS - category,
    },
    velocity,
  });
  World.add(engine.world, [
    motion,
  ]);
  motion.attr = {
    strength: 1,
    type,
    player,
  };

  Events.on(engine, 'beforeUpdate', () => {
    Body.setVelocity(motion, velocity);
    const scale = motion.attr.strength / motion.circleRadius;
    Body.scale(motion, scale, scale);
    motion.attr.strength += 1;
    if (motion.attr.strength >= strength) {
      World.remove(engine.world, motion);
    }
  });
}