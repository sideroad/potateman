import {
  World,
  Events,
  Body,
  Bodies,
} from 'matter-js';
import Sprite from './Sprite';
import COLLISION from './collision';
import { getPunchStrength } from './potateman';
import shrink from './motions/shrink';

export const shockWaveRender = {
  strokeStyle: '#ffffff',
  fillStyle: '#38a1db',
  opacity: 0.5,
  lineWidth: 1,
};

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
      opacity: 0.75,
    },
    isStatic: true,
    isSensor: true,
  });

  const profile = Bodies.circle(0, 50, 25, {
    render: {
      sprite: {
        texture: image,
        xScale: 0.25,
        yScale: 0.25,
      },
    },
    isSensor: true,
    isStatic: true,
  });
  World.add(engine.world, [profile]);

  const sprite = new Sprite(body, 'ghost', [
    {
      state: 'stand',
      duration: 6,
      steps: 4,
    },
    {
      state: 'guard',
    },
    {
      state: 'punch',
    },
  ]);
  sprite.setState('stand');
  sprite.render();
  World.add(engine.world, [body]);

  Events.on(engine, 'beforeUpdate', () => {
    const { x = 0, y = 0 } = body.position;
    sprite.render();

    // profile
    Body.setPosition(profile, {
      x,
      y: y - 40,
    });

    const { sinkMotion, curse } = body.attr;

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

    if (curse && curse % 5 === 0) {
      shrink({
        engine,
        type: 'curse',
        strength: 12,
        velocity: {
          x: 0,
          y: -7,
        },
        render: {
          strokeStyle: '#ffffff',
          fillStyle: '#444444',
          opacity: 0.5,
          lineWidth: 1,
        },
        category: body.attr.category,
        position: {
          x: body.position.x,
          y: body.position.y,
        },
        player: body.attr.player,
      });
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
    punchGage: 0,
    power: 50,
    category: COLLISION.NONE,
    magic: 0,
    type: 'ghost',
    player,
    profile,
    profileScore: 1,
    curse: 0,
  };
  return {
    body,
    sprite,
    image,
  };
}


export function destroy({ engine, body }) {
  World.remove(engine.world, body.attr.profile);
  if (body.attr.sinkMotion) {
    World.remove(engine.world, body.attr.sinkMotion);
  }
  World.remove(engine.world, body);
}
