import shrink from './shrink';

export default function cureFn({
  engine,
  body,
  strokeStyle = '#aaaaaa',
  fillStyle = '#ddccff',
  strength = 15,
  velocity = {
    x: 0,
    y: -5,
  },
}) {
  shrink({
    engine,
    type: 'particle',
    strength,
    velocity,
    render: {
      strokeStyle,
      fillStyle,
      opacity: 0.75,
      lineWidth: 1,
    },
    category: body.attr.category,
    position: body.position,
    player: body.attr.player,
  });
}
