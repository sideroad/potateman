import {
  World,
  Events,
  Bodies,
} from 'matter-js';

export default function prefetch({ engine }) {
  fetch('/prefetch.json')
    .then(res => res.json())
    .then((list) => {
      const bodies = list.map(item =>
        Bodies.rectangle(0, 0, 10, 10, {
          render: {
            sprite: {
              texture: item,
            },
          },
        }));
      World.add(engine.world, bodies);
      let count = 0;
      Events.on(engine, 'beforeUpdate', () => {
        if (count === 1) {
          bodies.forEach(body => World.remove(engine.world, body));
        } else {
          count += 1;
        }
      });
    });
}
