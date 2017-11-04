import {
  World,
  Bodies,
} from 'matter-js';

export default function gard({ engine, body, sprite }) {
  sprite.setState('gard');
  if (body.attr.gardGage > 10) {
    // eslint-disable-next-line no-param-reassign
    body.attr.gardGage -= 1;
  }
  if (!body.attr.gardMotion) {
    const gardMotion = Bodies.circle(body.position.x, body.position.y, 1, {
      render: {
        strokeStyle: '#ffffff',
        fillStyle: '#67A70C',
        opacity: 0.3,
        lineWidth: 1,
      },
      isStatic: true,
    });
    // eslint-disable-next-line no-param-reassign
    body.attr.gardMotion = gardMotion;
    World.add(engine.world, [gardMotion]);
  }
  // eslint-disable-next-line no-param-reassign
  body.attr.gardMotion.attr = {
    strength: body.attr.gardGage,
    type: 'gard',
  };
}
