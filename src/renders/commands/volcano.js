import {
  World,
  Events,
  Bodies,
  Body,
} from 'matter-js';
import _ from 'lodash';
import COLLISION from '../collision';
import MAGIC from '../magic';

const getVolcanoStrength = ({ magic }) => {
  const maticStrength = magic / 4;
  // eslint-disable-next-line no-nested-ternary
  const strength = maticStrength < 1 ? 1 :
  // eslint-disable-next-line indent
                   maticStrength > 200 ? 200 : maticStrength;
  return strength;
};

export default function ({
  engine,
  sprite,
  body,
  size,
}) {
  const { category } = body.attr;
  if (body.attr.magic < MAGIC.volcano) {
    return;
  }
  const volcanos = [];
  const strength = getVolcanoStrength(body.attr);
  _.times(body.attr.magic / 10, () => {
    const volcanoMotion = Bodies.rectangle(sprite.direction === 'left' ? size.width : 0, size.height, 20, 20, {
      friction: 0,
      render: {
        sprite: {
          texture: '/images/ground.png',
        },
      },
      force: {
        x: (Math.random() / 25) * (sprite.direction === 'left' ? -1 : 1),
        y: -0.04,
      },
      collisionFilter: {
        category: COLLISION.ATTACK,
        // eslint-disable-next-line no-bitwise
        mask: COLLISION.POTATEMANS - category,
      },
    });

    Body.setAngularVelocity(volcanoMotion, sprite.direction === 'left' ? -0.5 : 0.5);
    volcanoMotion.attr = {
      strength,
      type: 'volcano',
      player: body.attr.player,
    };
    volcanos.push(volcanoMotion);
  });
  // eslint-disable-next-line no-param-reassign
  body.attr.magic = 1;

  World.add(engine.world, volcanos);

  Events.on(engine, 'beforeUpdate', () => {
    volcanos.forEach((volcanoMotion) => {
      if (!volcanoMotion.position.y > size.height * 2) {
        World.remove(engine.world, volcanoMotion);
      }
    });
  });
}
