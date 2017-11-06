import {
  World,
  Events,
  Body,
  Bodies,
} from 'matter-js';
import Sprite from './Sprite';
import COLLISION from './collision';

export const shockWaveRender = {
  strokeStyle: '#ffffff',
  fillStyle: '#38a1db',
  opacity: 0.5,
  lineWidth: 1,
};

export function getPunchStrength({ punchGage, power }) {
  const punchStrength = (punchGage * power) / 100;
  // eslint-disable-next-line no-nested-ternary
  const strength = punchStrength < 5 ? 5 :
  // eslint-disable-next-line indent
                   punchStrength > 20 ? 20 : punchStrength;
  return strength;
}

export default function ghost({
  engine,
  size,
  image,
  player,
}) {
  const category = COLLISION.GHOST;
  const body = Bodies.rectangle(size.width / 2, size.height / 3, 23, 29, {
    frictionAir: 0,
    frictionStatic: 20,
    density: 0.75,
    collisionFilter: {
      category,
    },
    render: {
      sprite: {
        texture: '/images/ghost-stand-left-1.png',
        xScale: -0.5,
        yScale: 0.5,
      },
      opacity: 0.5,
    },
    isStatic: true,
    isSensor: true,
  });

  const caret = Bodies.circle(0, 50, 10, {
    render: {
      sprite: {
        texture: image,
      },
    },
    isSensor: true,
    isStatic: true,
  });
  World.add(engine.world, [caret]);

  const sprite = new Sprite(body, 'ghost', [
    {
      state: 'stand',
      duration: 6,
      steps: 4,
    },
  ]);
  sprite.setState('stand');
  sprite.render();
  World.add(engine.world, [body]);

  Events.on(engine, 'beforeUpdate', () => {
    const { x = 0, y = 0 } = body.position;
    sprite.render();

    // caret
    Body.setPosition(caret, {
      x,
      y: y - 30,
    });

    const { sinkMotion } = body.attr;

    // sink
    if (sinkMotion) {
      const strength = getPunchStrength(body.attr);
      const scale = strength / sinkMotion.circleRadius;
      Body.setPosition(sinkMotion, {
        x,
        y,
      });
      Body.scale(sinkMotion, scale, scale);
    }

    // ghost
    Body.set(body, {
      angle: 0,
      collisionFilter: {
        category: body.attr.category,
      },
    });
  });
  body.attr = {
    punchGage: 1,
    power: 50,
    category,
    magic: 0,
    type: 'ghost',
    player,
    caret,
    caretScore: 1,
    punched: false,
  };
  return {
    body,
    sprite,
    image,
  };
}


export function destroy({ engine, body }) {
  World.remove(engine.world, body.attr.caret);
  if (body.attr.sinkMotion) {
    World.remove(engine.world, body.attr.sinkMotion);
  }
  World.remove(engine.world, body);
}
