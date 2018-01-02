import {
  World,
} from 'matter-js';
import { getPunchStrength } from '../characters/potateman';
import swell from '../motions/swell';


const shockWaveRender = {
  strokeStyle: '#ffffff',
  fillStyle: '#38a1db',
  opacity: 0.5,
  lineWidth: 1,
};

export default function punch({
  engine,
  body,
  sprite,
  direction,
}) {
  if (body.attr.sinkMotion) {
    World.remove(engine.world, body.attr.sinkMotion);
    // eslint-disable-next-line no-param-reassign
    body.attr.sinkMotion = undefined;
    sprite.setState('punch');
  }
  const strength = getPunchStrength(body.attr);
  // eslint-disable-next-line no-nested-ternary
  const speed = (strength / 1.75) + Math.abs(body.velocity.x);
  const velocity = {
    x:
    direction.left ? speed * -1 :
    direction.right ? speed * 1 :
    !direction.up && !direction.down && sprite.direction === 'left' ? speed * -1 :
    !direction.up && !direction.down && sprite.direction === 'right' ? speed * 1 :
    0,
    y:
    direction.up ? speed * -1 :
    direction.down ? speed * 1 :
    0,
  };
  swell({
    engine,
    body,
    strength,
    type: 'shockWave',
    velocity,
    render: shockWaveRender,
    category: body.attr.category,
    player: body.attr.player,
    position: body.position,
    initial: strength / 2,
    ratio: strength / 14,
  });
  // eslint-disable-next-line no-param-reassign
  body.attr.punchGage = 0;
}
