import {
  World,
  Events,
  Bodies,
} from 'matter-js';
import _ from 'lodash';
import { getThunderStrength } from '../potateman';
import Sprite from '../Sprite';
import COLLISION from '../collision';

export default function thunder({
  engine,
  body,
  sprite,
  size,
}) {
  if (body.attr.magic < 2) {
    return;
  }
  const { x = 0 } = body.position;
  const { category } = body.attr;

  sprite.setState('punch');
  const strength = getThunderStrength(body.attr);
  const thunderOptions = {
    density: 0.1,
    frictionAir: 0,
    render: {
      sprite: {
        texture: '/images/thunder-attack-left-1.png',
        xScale: 2,
        yScale: 2,
      },
    },
    collisionFilter: {
      category: COLLISION.ATTACK,
      // eslint-disable-next-line no-bitwise
      mask: COLLISION.POTATEMANS - category,
    },
    isSensor: true,
  };
  const thunderbolts = [];
  _.times(Math.ceil(size.height / 40), (index) => {
    const motion = Bodies.rectangle(x, (index * 40), 40, 40, thunderOptions);
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

  // eslint-disable-next-line no-param-reassign
  body.attr.magic = 1;

  Events.on(engine, 'beforeUpdate', () => {
    thunderbolts.forEach((thunderbolt) => {
      thunderbolt.sprite.render();
      if (thunderbolt.sprite.step === 7) {
        World.remove(engine.world, thunderbolt.body);
      }
    });
  });
}
