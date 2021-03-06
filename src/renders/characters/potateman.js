import {
  World,
  Events,
  Body,
  Bodies,
} from 'matter-js';
import queryString from 'query-string';
import Sprite from '../Sprite';
import COLLISION from '../collision';
import MAGIC from '../magic';
import flamethrower from '../commands/flamethrower';

export function getPunchStrength({ punchGage, power }) {
  const punchStrength = (punchGage * power) / 100;
  const maxStrength = (power / 100) * 27;
  // eslint-disable-next-line no-nested-ternary
  const strength = punchStrength < 15 ? 15 :
  // eslint-disable-next-line indent
                   punchStrength > maxStrength ? maxStrength : punchStrength;
  return strength;
}

export default function ({
  engine,
  size,
  image,
  name,
  index,
  player,
  cpu,
  fbid,
  focus,
  render,
  friction,
  restitution,
}) {
  const category = COLLISION[`POTATEMAN${index}`];
  const startX = (size.width / 2) + (index % 2 ? (index * 20) + 20 : index * -20);
  const potateman = Bodies.rectangle(startX, size.height / 3, 34.5, 43.5, {
    frictionAir: 0.01,
    frictionStatic: friction,
    restitution,
    density: 0.75,
    collisionFilter: {
      category,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.GROUND |
            COLLISION.WALL |
            COLLISION.VOLCANO |
            COLLISION.POTATEMANS |
            COLLISION.ATTACK |
            COLLISION.ITEM,
    },
    render: {
      sprite: {
        texture: '/images/potateman-stand-left-1.png',
        xScale: 0.75,
        yScale: 0.75,
      },
    },
  });
  const outsiderOption = {
    render: {
      sprite: {
        texture: image,
        xScale: 0.375,
        yScale: 0.375,
      },
      opacity: 0,
    },
    isSensor: true,
    isStatic: true,
  };
  const outsiderBottom = Bodies.circle(0, 50, 37.5, outsiderOption);
  World.add(engine.world, [outsiderBottom]);
  const outsiderTop = Bodies.circle(0, 50, 37.5, outsiderOption);
  World.add(engine.world, [outsiderTop]);
  const outsiderLeft = Bodies.circle(0, 50, 37.5, outsiderOption);
  World.add(engine.world, [outsiderLeft]);
  const outsiderRight = Bodies.circle(0, 50, 37.5, outsiderOption);
  World.add(engine.world, [outsiderRight]);

  const profile = Bodies.circle(0, 50, 37.5, {
    render: {
      sprite: {
        texture: image,
        xScale: 0.375,
        yScale: 0.375,
      },
    },
    isSensor: true,
    isStatic: true,
  });
  World.add(engine.world, [profile]);

  const indicator = Bodies.circle(0, 50, 22.5, {
    render: {
      strokeStyle: '#ffffff',
      fillStyle: 'transparent',
      lineWidth: 7.5,
    },
    isSensor: true,
    isStatic: true,
  });
  World.add(engine.world, [indicator]);

  const sprite = new Sprite(potateman, 'potateman', [
    { state: 'stand' },
    {
      state: 'punch',
      duration: 10,
      steps: 1,
      next: 'stand',
    },
    { state: 'guard' },
    { state: 'squat' },
    { state: 'squat-guard' },
    {
      state: 'walk',
      duration: 5,
      steps: 4,
    },
  ]);
  sprite.setState('stand');
  sprite.render();
  World.add(engine.world, [potateman]);

  const flamethrowerBody = Bodies.rectangle(0, 0, 20, 10, {
    render: {
      sprite: {
        texture: '/images/flamethrower-equip-left-1.png',
        xScale: 0.5,
        yScale: 0.5,
      },
      opacity: 0,
    },
    isSensor: true,
    isStatic: true,
  });
  const flamethrowerSprite = new Sprite(flamethrowerBody, 'flamethrower', [
    { state: 'equip' },
  ]);
  flamethrowerSprite.setState('equip');
  flamethrowerSprite.render();
  World.add(engine.world, [flamethrowerBody]);

  let count = 0;
  const damageParticles = [];
  Events.on(engine, 'beforeUpdate', () => {
    const { x = 0, y = 0 } = potateman.position;
    sprite.render();

    // profile
    Body.setPosition(profile, {
      x,
      y: y - 55,
    });

    // indicator
    Body.setPosition(indicator, {
      x,
      y: y - 55,
    });
    const assignedMagic = Object.keys(MAGIC).filter(magic =>
      potateman.attr.magic >= MAGIC[magic].min).reverse()[0];
    indicator.render.strokeStyle = MAGIC[assignedMagic] ? MAGIC[assignedMagic].color : '#FFFFFF';

    // outsider
    const maxX = render.bounds.max.x;
    const maxY = render.bounds.max.y;
    const minX = render.bounds.min.x;
    const minY = render.bounds.min.y;
    Body.setPosition(outsiderBottom, {
      x: maxX - 22.5 < x ? maxX - 22.5 : x < minX + 22.5 ? minX + 22.5 : x,
      y: maxY - 22.5,
    });
    Body.setPosition(outsiderTop, {
      x: maxX - 22.5 < x ? maxX - 22.5 : x < minX + 22.5 ? minX + 22.5 : x,
      y: minY + 22.5,
    });
    Body.setPosition(outsiderLeft, {
      x: minX + 22.5,
      y,
    });
    Body.setPosition(outsiderRight, {
      x: maxX - 22.5,
      y,
    });
    const {
      sinkMotion,
      guardMotion,
      flamethrowers,
      giant,
    } = potateman.attr;

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

    // guard
    if (guardMotion) {
      const strength = potateman.attr.guardGage;
      const scale = (strength / guardMotion.circleRadius) / 5;
      Body.setPosition(guardMotion, {
        x,
        y,
      });
      Body.scale(guardMotion, scale, scale);
    }

    // flamethrower
    if (flamethrowers > 0) {
      Body.setPosition(flamethrowerBody, {
        x,
        y: y + 7,
      });
      flamethrowerSprite.setDirection(sprite.direction);
      flamethrowerSprite.render();
      flamethrowerBody.render.opacity = 1;
      flamethrower({
        body: potateman,
        engine,
        sprite,
      });
    } else {
      flamethrowerBody.render.opacity = 0;
    }

    // giant
    if (giant > 0) {
      potateman.attr.giant -= 1;
      if (potateman.attr.giant === 0) {
        Body.scale(potateman, 0.5, 0.5);
        potateman.render.sprite.xScale = 0.75;
        potateman.render.sprite.yScale = 0.75;
        potateman.attr.power /= 1.75;
      }
    }

    // damage
    if (count > 15) {
      const particle = Bodies.circle(x, y, (potateman.attr.damage / 20) + 1, {
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

    // potateman
    Body.set(potateman, {
      angle: 0,
      collisionFilter: {
        category: potateman.attr.category,
        mask: potateman.velocity.y >= 0 && !potateman.attr.transparent ?
        // eslint-disable-next-line no-bitwise
          COLLISION.WALL |
          COLLISION.GROUND |
          COLLISION.VOLCANO |
          COLLISION.POTATEMANS |
          COLLISION.ATTACK |
          COLLISION.ITEM
          :
          // eslint-disable-next-line no-bitwise
          COLLISION.WALL |
          COLLISION.VOLCANO |
          COLLISION.POTATEMANS |
          COLLISION.ATTACK |
          COLLISION.ITEM,
      },
    });
  });
  const params = queryString.parse(window.location.search);
  potateman.attr = {
    punchGage: 0,
    guardGage: 100,
    guarding: false,
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
    profile,
    score: 0,
    teleported: false,
    indicator,
    outsiderBottom,
    outsiderTop,
    outsiderLeft,
    outsiderRight,
    profileScore: 1,
    transparent: false,
    flamethrowers: 0,
    giant: 0,
    lastAttacked: undefined,
    cursed: false,
    stunned: 0,
  };
  return {
    body: potateman,
    fbid,
    sprite,
    name,
    image,
    cpu,
    focus,
    direction: {},
  };
}


export function destroy({ engine, body }) {
  World.remove(engine.world, body.attr.profile);
  World.remove(engine.world, body.attr.indicator);
  World.remove(engine.world, body.attr.outsiderTop);
  World.remove(engine.world, body.attr.outsiderLeft);
  World.remove(engine.world, body.attr.outsiderRight);
  World.remove(engine.world, body.attr.outsiderBottom);
  if (body.attr.sinkMotion) {
    World.remove(engine.world, body.attr.sinkMotion);
  }
  World.remove(engine.world, body);
}
