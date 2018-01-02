import {
  World,
  Bodies,
} from 'matter-js';
import { getPunchStrength } from '../characters/potateman';

const shockWaveRender = {
  strokeStyle: '#ffffff',
  fillStyle: '#38a1db',
  opacity: 0.5,
  lineWidth: 1,
};

export default function sink({ engine, body, sprite }) {
  sprite.setState('guard');
  // eslint-disable-next-line no-param-reassign
  body.attr.punchGage += 0.75;

  const strength = getPunchStrength(body.attr);
  if (!body.attr.sinkMotion) {
    const sinkMotion = Bodies.circle(body.position.x, body.position.y, 1, {
      render: shockWaveRender,
      isStatic: true,
    });
    // eslint-disable-next-line no-param-reassign
    body.attr.sinkMotion = sinkMotion;
    World.add(engine.world, [sinkMotion]);
  }
  // eslint-disable-next-line no-param-reassign
  body.attr.sinkMotion.attr = {
    strength,
    type: 'sink',
  };
}
