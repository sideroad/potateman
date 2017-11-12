import shrink from './shrink';

export default function cureFn({ engine, body }) {
  shrink({
    engine,
    type: 'particle',
    strength: 15,
    velocity: {
      x: 0,
      y: -5,
    },
    render: {
      strokeStyle: '#999999',
      fillStyle: '#dddddd',
      opacity: 0.75,
      lineWidth: 1,
    },
    category: body.attr.category,
    position: body.position,
    player: body.attr.player,
  });
}
