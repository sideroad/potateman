import {
  World,
  Events,
  Body,
  Bodies,
} from 'matter-js';
import Sprite from './Sprite';
import COLLISION from './collision';

const getStrength = ({ punchGage, power }) => {
  const punchStrength = (punchGage * power) / 100;
  // eslint-disable-next-line no-nested-ternary
  const strength = punchStrength < 5 ? 5 :
  // eslint-disable-next-line indent
                   punchStrength > 30 ? 30 : punchStrength;
  return strength;
};

export default function ({
  engine,
  size,
  color,
  index,
  player,
}) {
  const category = COLLISION[`POTATEMAN${index}`];
  const potateman = Bodies.rectangle(size.width / 2, size.height / 3, 23, 29, {
    frictionAir: 0,
    frictionStatic: 20,
    density: 0.5,
    collisionFilter: {
      category,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.GROUND |
            COLLISION.VOLCANO |
            COLLISION.POTATEMANS |
            COLLISION.ATTACK |
            COLLISION.BOUNDARY,
    },
    render: {
      sprite: {
        texture: '/images/potateman-stand-left-1.png',
        xScale: -0.5,
        yScale: 0.5,
      },
    },
  });

  const caset = Bodies.polygon(0, 50, 3, 5, {
    render: {
      fillStyle: color,
    },
    isSensor: true,
    isStatic: true,
  });
  Body.setAngle(caset, -22.5);
  World.add(engine.world, [caset]);

  const sprite = new Sprite(potateman, 'potateman', [
    { state: 'stand' },
    {
      state: 'punch',
      duration: 10,
      steps: 1,
      next: 'stand',
    },
    { state: 'gard' },
    { state: 'squat' },
    { state: 'squat-gard' },
    {
      state: 'walk',
      duration: 5,
      steps: 4,
    },
  ]);
  sprite.setState('stand');
  sprite.render();
  World.add(engine.world, [potateman]);

  Events.on(engine, 'beforeUpdate', () => {
    sprite.render();
    Body.setPosition(caset, {
      x: potateman.position.x,
      y: potateman.position.y - 30,
    });
    const { sinkMotion, gardMotion } = potateman.attr;
    if (sinkMotion) {
      const strength = getStrength(potateman.attr);
      const scale = strength / sinkMotion.circleRadius;
      Body.setPosition(sinkMotion, {
        x: potateman.position.x,
        y: potateman.position.y,
      });
      Body.scale(sinkMotion, scale, scale);
    }
    if (gardMotion) {
      const strength = potateman.attr.gardGage;
      const scale = (strength / gardMotion.circleRadius) / 5;
      Body.setPosition(gardMotion, {
        x: potateman.position.x,
        y: potateman.position.y,
      });
      Body.scale(gardMotion, scale, scale);
    }
    Body.set(potateman, {
      angle: 0,
      collisionFilter: {
        category: potateman.attr.category,
        mask: potateman.velocity.y >= 0 ?
        // eslint-disable-next-line no-bitwise
          COLLISION.GROUND |
          COLLISION.VOLCANO |
          COLLISION.POTATEMANS |
          COLLISION.ATTACK |
          COLLISION.BOUNDARY
          :
          // eslint-disable-next-line no-bitwise
          COLLISION.VOLCANO |
          COLLISION.POTATEMANS |
          COLLISION.ATTACK |
          COLLISION.BOUNDARY,
      },
    });
  });
  potateman.attr = {
    punchGage: 0,
    gardGage: 100,
    garding: false,
    power: 100,
    damage: 0,
    magic: 1,
    flycount: 0,
    flying: false,
    index,
    category,
    type: 'potateman',
    player,
    color,
  };
  return {
    body: potateman,
    sprite,
    image: '/images/potateman-stand-left-1.png',
  };
}

const shockWaveRender = {
  strokeStyle: '#ffffff',
  fillStyle: '#38a1db',
  opacity: 0.5,
  lineWidth: 1,
};

export function sink({ engine, body, sprite }) {
  sprite.setState('gard');
  // eslint-disable-next-line no-param-reassign
  body.attr.punchGage += 1;
  // eslint-disable-next-line no-param-reassign
  body.attr.garding = true;
  const strength = getStrength(body.attr);
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

export function punch({ engine, body, sprite }) {
  const { x = 0, y = 0 } = body.position;
  const { category } = body.attr;

  World.remove(engine.world, body.attr.sinkMotion);
  // eslint-disable-next-line no-param-reassign
  body.attr.sinkMotion = undefined;
  sprite.setState('punch');
  const strength = getStrength(body.attr);
  const shockWave = Bodies.circle(x, y, strength, {
    render: shockWaveRender,
    density: 0.025,
    collisionFilter: {
      category: COLLISION.ATTACK,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.POTATEMANS - category,
    },
    force: {
      x: sprite.direction === 'left' ? -0.005 * (strength ** 2) : 0.005 * (strength ** 2),
      y: 0,
    },
  });
  World.add(engine.world, [
    shockWave,
  ]);
  shockWave.attr = {
    strength,
    type: 'shockWave',
    player: body.attr.player,
  };
  // eslint-disable-next-line no-param-reassign
  body.attr.punchGage = 0;

  Events.on(engine, 'beforeUpdate', () => {
    Body.setVelocity(shockWave, {
      x: shockWave.velocity.x,
      y: 0,
    });
    const scale = shockWave.attr.strength / strength;
    Body.scale(shockWave, scale, scale);
    shockWave.attr.strength -= 1;
    if (!shockWave.attr.strength) {
      World.remove(engine.world, shockWave);
    }
  });
}

export function gard({ engine, body, sprite }) {
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

export function gardCancel({ engine, body }) {
  // eslint-disable-next-line no-param-reassign
  body.attr.gardGage = 100;
  // eslint-disable-next-line no-param-reassign
  body.attr.garding = false;
  if (body.attr.gardMotion) {
    World.remove(engine.world, body.attr.gardMotion);
  }
  // eslint-disable-next-line no-param-reassign
  body.attr.gardMotion = undefined;
}
