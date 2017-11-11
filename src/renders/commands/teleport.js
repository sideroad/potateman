import shrink from '../motions/shrink';

export default function teleportFn({
  engine,
  body,
  x,
  sprite,
}) {
  // eslint-disable-next-line no-param-reassign
  body.attr.teleported = false;
  shrink({
    engine,
    type: 'particle',
    strength: 15,
    velocity: {
      x: x > 0 ? 10 : -10,
      y: 0,
    },
    render: {
      strokeStyle: '#ffffff',
      fillStyle: '#F7CC5F',
      opacity: 0.5,
      lineWidth: 1,
    },
    category: body.attr.category,
    position: {
      x: body.position.x + (x > 0 ? -100 : 100),
      y: body.position.y,
    },
    player: body.attr.player,
  });
  sprite.setDirection(x > 0 ? 'left' : 'right');
}
