import swell from '../motions/swell';

export default function flamethrowerFn({
  engine,
  body,
  sprite,
}) {
  sprite.setState('punch');
  // eslint-disable-next-line no-nested-ternary
  const speed = 10;
  // eslint-disable-next-line no-param-reassign
  body.attr.flamethrowers -= 1;

  if (body.attr.flamethrowers % 1 === 0) {
    swell({
      engine,
      body,
      strength: 20,
      type: 'shockWave',
      render: {
        strokeStyle: '#ffffff',
        fillStyle: body.attr.flamethrowers % 2 === 0 ? '#FB3C02' : '#EE7800',
        opacity: 0.5,
        lineWidth: 1,
      },
      category: body.attr.category,
      player: body.attr.player,
      position: body.position,
      velocity: {
        x: sprite.direction === 'left' ? speed * -1 : speed,
        y: 0,
      },
    });
  }
}
