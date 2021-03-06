import {
  World,
  Events,
  Bodies,
} from 'matter-js';
import _ from 'lodash';
import Sprite from '../Sprite';
import COLLISION from '../collision';
import MAGIC from '../magic';
import shrink from '../motions/shrink';

function getThunderStrength({ magic }) {
  const maticStrength = magic / 8;
  // eslint-disable-next-line no-nested-ternary
  const strength = maticStrength < 1 ? 1 :
  // eslint-disable-next-line indent
                   maticStrength > 300 ? 300 : maticStrength;
  return strength;
}

export default function thunder({
  engine,
  body,
  sprite,
  size,
  ratio,
}) {
  if (body.attr.magic < MAGIC.thunder.min) {
    return;
  }
  const { x = 0 } = body.position;
  const { category } = body.attr;

  if (sprite) {
    sprite.setState('squat');
  }
  const strength = getThunderStrength(body.attr) * ratio;
  const thunderOptions = {
    density: 0.1,
    frictionAir: 0,
    render: {
      sprite: {
        texture: MAGIC.thunder.image,
        xScale: 2,
        yScale: 2,
      },
    },
    collisionFilter: {
      category: COLLISION.ATTACK,
      // eslint-disable-next-line no-bitwise
      mask: (COLLISION.POTATEMANS - category) | COLLISION.ATTACK,
    },
    isSensor: true,
  };
  const thunderbolts = [];
  _.times(Math.ceil((size.height * 3) / 40), (index) => {
    const motion = Bodies.rectangle(x, (index * 40) - size.height, 40, 40, thunderOptions);
    World.add(engine.world, motion);
    motion.attr = {
      strength,
      type: 'thunder',
      player: body.attr.player,
    };
    const thunderSprite = new Sprite(motion, 'thunder', [
      {
        state: 'attack',
        duration: 1,
        steps: 7,
      },
    ]);
    thunderSprite.setDirection('left');
    thunderSprite.setState('attack');
    thunderSprite.render();
    thunderbolts.push({
      body: motion,
      sprite: thunderSprite,
    });
  });
  const shrinkRender = {
    strokeStyle: '#ffffff',
    fillStyle: '#FFEC47',
    opacity: 0.5,
    lineWidth: 1,
  };
  // eslint-disable-next-line no-nested-ternary
  const speed = strength < 15 ? 15 : strength > 20 ? 20 : strength;
  const shrinkOptions = {
    engine,
    body,
    strength: 10,
    type: 'shockWave',
    render: shrinkRender,
    category: body.attr.category,
    player: body.attr.player,
    position: body.position,
  };

  shrink({
    ...shrinkOptions,
    velocity: {
      x: 1 * speed,
      y: -1 * speed,
    },
  });
  shrink({
    ...shrinkOptions,
    velocity: {
      x: -1 * speed,
      y: -1 * speed,
    },
  });
  // eslint-disable-next-line no-param-reassign
  body.attr.magic = 1;

  const tick = () => {
    thunderbolts.forEach((thunderbolt) => {
      thunderbolt.sprite.render();
      if (thunderbolt.sprite.step === 7) {
        World.remove(engine.world, thunderbolt.body);
        Events.off(engine, 'beforeUpdate', tick);
      }
    });
  };
  Events.on(engine, 'beforeUpdate', tick);
}
