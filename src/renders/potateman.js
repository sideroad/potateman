import {
  World,
  Events,
  Body,
  Bodies,
} from 'matter-js';
import queryString from 'query-string';
import Sprite from './Sprite';
import COLLISION from './collision';
import MAGIC from './magic';

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

export function getMeteoriteStrength({ magic }) {
  const maticStrength = magic / 4;
  // eslint-disable-next-line no-nested-ternary
  const strength = maticStrength < 1 ? 1 :
  // eslint-disable-next-line indent
                   maticStrength > 300 ? 300 : maticStrength;
  return strength;
}

export function getThunderStrength({ magic }) {
  const maticStrength = magic / 6;
  // eslint-disable-next-line no-nested-ternary
  const strength = maticStrength < 1 ? 1 :
  // eslint-disable-next-line indent
                   maticStrength > 300 ? 300 : maticStrength;
  return strength;
}

export default function ({
  engine,
  size,
  image,
  index,
  player,
}) {
  const category = COLLISION[`POTATEMAN${index}`];
  const startX = (size.width / 2) + (index % 2 ? (index * 20) + 20 : index * -20);
  const potateman = Bodies.rectangle(startX, size.height / 3, 23, 29, {
    frictionAir: 0,
    frictionStatic: 20,
    density: 0.75,
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
  const outsiderOption = {
    render: {
      sprite: {
        texture: image,
      },
      opacity: 0,
    },
    isSensor: true,
    isStatic: true,
  };
  const outsiderBottom = Bodies.circle(0, 50, 5, 5, outsiderOption);
  World.add(engine.world, [outsiderBottom]);
  const outsiderTop = Bodies.circle(0, 50, 5, 5, outsiderOption);
  World.add(engine.world, [outsiderTop]);
  const outsiderLeft = Bodies.circle(0, 50, 5, 5, outsiderOption);
  World.add(engine.world, [outsiderLeft]);
  const outsiderRight = Bodies.circle(0, 50, 5, 5, outsiderOption);
  World.add(engine.world, [outsiderRight]);

  const caret = Bodies.circle(0, 50, 10, {
    sprite: {
      texture: image,
    },
    isSensor: true,
    isStatic: true,
  });
  World.add(engine.world, [caret]);

  const indicators = Object.keys(MAGIC).map(magic =>
    Bodies.circle(0, 0, 5, {
      render: {
        fillStyle: MAGIC[magic].color,
      },
      isSensor: true,
      isStatic: true,
    }));
  World.add(engine.world, indicators);

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

  let count = 0;
  const damageParticles = [];
  Events.on(engine, 'beforeUpdate', () => {
    const { x = 0, y = 0 } = potateman.position;
    sprite.render();

    // caret
    Body.setPosition(caret, {
      x,
      y: y - 30,
    });
    const caretScore = 1 + (potateman.attr.magic / 50);
    const caretScale = caretScore / potateman.attr.caretScore;
    potateman.attr.caretScore = caretScore;
    Body.scale(caret, caretScale, caretScale);

    // outsider
    Body.setPosition(outsiderBottom, {
      x,
      y: size.height - 15,
    });
    Body.setPosition(outsiderTop, {
      x,
      y: 15,
    });
    Body.setPosition(outsiderLeft, {
      x: 15,
      y,
    });
    Body.setPosition(outsiderRight, {
      x: size.width - 15,
      y,
    });
    const { sinkMotion, gardMotion } = potateman.attr;

    // sink
    if (sinkMotion) {
      const strength = getPunchStrength(potateman.attr);
      const scale = strength / sinkMotion.circleRadius;
      Body.setPosition(sinkMotion, {
        x,
        y,
      });
      Body.scale(sinkMotion, scale, scale);
    }

    // gard
    if (gardMotion) {
      const strength = potateman.attr.gardGage;
      const scale = (strength / gardMotion.circleRadius) / 5;
      Body.setPosition(gardMotion, {
        x,
        y,
      });
      Body.scale(gardMotion, scale, scale);
    }

    // damage
    if (count > 10) {
      const particle = Bodies.circle(x, y, (potateman.attr.damage / 10) + 1, {
        frictionAir: 0,
        force: {
          x: sprite.direction === 'left' ? (potateman.attr.damage / 100000) : (potateman.attr.damage / -100000),
          y: (potateman.attr.damage / -100000),
        },
        render: {
          opacity: 0.3,
          fillStyle: '#ec6d71',
        },
        isSensor: true,
      });
      damageParticles.push(particle);
      World.add(engine.world, particle);
      count = 0;
    }
    count += 1;
    damageParticles.forEach((particle) => {
      if (particle.circleRadius < 1) {
        damageParticles.shift();
        World.remove(engine.world, particle);
      } else {
        Body.scale(particle, 0.9, 0.9);
      }
    });

    // magic indicator
    Object.keys(MAGIC).forEach((magic, magicIndex) => {
      const indicator = potateman.attr.indicators[magicIndex];
      indicator.render.opacity = potateman.attr.magic >= MAGIC[magic].min ? 0.5 : 0;
      Body.setPosition(indicator, {
        x: (x - (magicIndex * 15)) + 15,
        y: y - 45,
      });
    });

    // potateman
    Body.set(potateman, {
      angle: 0,
      collisionFilter: {
        category: potateman.attr.category,
        mask: potateman.velocity.y >= 0 && !potateman.attr.transparent ?
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
  const params = queryString.parse(window.location.search);
  potateman.attr = {
    punchGage: 0,
    gardGage: 100,
    garding: false,
    power: 100,
    damage: 0,
    magic: Number(params.magic) || 1,
    flycount: 0,
    flying: false,
    keepTouchingJump: false,
    index,
    category,
    type: 'potateman',
    player,
    caret,
    indicators,
    outsiderBottom,
    outsiderTop,
    outsiderLeft,
    outsiderRight,
    caretScore: 1,
    transparent: false,
  };
  return {
    body: potateman,
    sprite,
    image,
  };
}


export function destroy({ engine, body }) {
  World.remove(engine.world, body.attr.caret);
  World.remove(engine.world, body.attr.outsiderTop);
  World.remove(engine.world, body.attr.outsiderLeft);
  World.remove(engine.world, body.attr.outsiderRight);
  World.remove(engine.world, body.attr.outsiderBottom);
  body.attr.indicators.forEach(indicator =>
    World.remove(engine.world, indicator));
  if (body.attr.sinkMotion) {
    World.remove(engine.world, body.attr.sinkMotion);
  }
  World.remove(engine.world, body);
}
