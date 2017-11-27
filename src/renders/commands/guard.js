import {
  World,
  Bodies,
} from 'matter-js';

export default function guard({ engine, body, sprite }) {
  sprite.setState('guard');
  if (body.attr.guardGage > 1) {
    // eslint-disable-next-line no-param-reassign
    body.attr.guardGage -= 1;
  }
  // eslint-disable-next-line no-param-reassign
  body.attr.guarding = true;
  if (!body.attr.guardMotion) {
    const guardMotion = Bodies.circle(body.position.x, body.position.y, 1, {
      render: {
        strokeStyle: '#ffffff',
        fillStyle: '#F7CC5F',
        opacity: 0.5,
        lineWidth: 1,
      },
      isStatic: true,
    });
    // eslint-disable-next-line no-param-reassign
    body.attr.guardMotion = guardMotion;
    World.add(engine.world, [guardMotion]);
  }
  // eslint-disable-next-line no-param-reassign
  body.attr.guardMotion.attr = {
    strength: body.attr.guardGage,
    type: 'guard',
  };
}
