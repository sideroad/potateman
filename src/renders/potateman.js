import {
  World,
  Events,
  Body,
  Bodies,
} from 'matter-js';
import queryString from 'query-string';
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
  color,
  index,
  player,
}) {
  const category = COLLISION[`POTATEMAN${index}`];
  const potateman = Bodies.rectangle(size.width / 2, size.height / 3, 23, 29, {
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
  console.log(potateman);
  const outsiderOption = {
    render: {
      fillStyle: color,
      opacity: 0,
    },
    isSensor: true,
    isStatic: true,
  };
  const outsiderBottom = Bodies.polygon(0, 50, 3, 5, outsiderOption);
  Body.setAngle(outsiderBottom, -22.5);
  World.add(engine.world, [outsiderBottom]);
  const outsiderTop = Bodies.polygon(0, 50, 3, 5, outsiderOption);
  Body.setAngle(outsiderTop, 22.5);
  World.add(engine.world, [outsiderTop]);
  const outsiderLeft = Bodies.polygon(0, 50, 3, 5, outsiderOption);
  Body.setAngle(outsiderLeft, 0);
  World.add(engine.world, [outsiderLeft]);
  const outsiderRight = Bodies.polygon(0, 50, 3, 5, outsiderOption);
  Body.setAngle(outsiderRight, 45);
  World.add(engine.world, [outsiderRight]);

  const caret = Bodies.polygon(0, 50, 3, 5, {
    render: {
      fillStyle: color,
    },
    isSensor: true,
    isStatic: true,
  });
  Body.setAngle(caret, -22.5);
  World.add(engine.world, [caret]);

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

    // caret
    Body.setPosition(caret, {
      x: potateman.position.x,
      y: potateman.position.y - 30,
    });
    const caretScore = 1 + (potateman.attr.magic / 50);
    const caretScale = caretScore / potateman.attr.caretScore;
    potateman.attr.caretScore = caretScore;
    Body.scale(caret, caretScale, caretScale);

    // outsider
    Body.setPosition(outsiderBottom, {
      x: potateman.position.x,
      y: size.height - 15,
    });
    Body.setPosition(outsiderTop, {
      x: potateman.position.x,
      y: 15,
    });
    Body.setPosition(outsiderLeft, {
      x: 15,
      y: potateman.position.y,
    });
    Body.setPosition(outsiderRight, {
      x: size.width - 15,
      y: potateman.position.y,
    });
    const { sinkMotion, gardMotion } = potateman.attr;
    if (sinkMotion) {
      const strength = getPunchStrength(potateman.attr);
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
    color,
    caret,
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
    image: '/images/potateman-stand-left-1.png',
  };
}


export function destroy({ engine, body }) {
  World.remove(engine.world, body.attr.caret);
  World.remove(engine.world, body.attr.outsiderTop);
  World.remove(engine.world, body.attr.outsiderLeft);
  World.remove(engine.world, body.attr.outsiderRight);
  World.remove(engine.world, body.attr.outsiderBottom);
  World.remove(engine.world, body);
}
