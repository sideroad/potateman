import {
  World,
  Bodies,
  Body,
} from 'matter-js';
import _ from 'lodash';
import COLLISION from '../collision';
import MAGIC from '../magic';
import random from '../../helpers/random';

const getVolcanoStrength = ({ magic }) => {
  const magicStrength = magic / 4;
  // eslint-disable-next-line no-nested-ternary
  const strength = magicStrength > 200 ? 200 : magicStrength;
  return strength;
};

export default function ({
  engine,
  sprite,
  body,
  size,
}) {
  const { category } = body.attr;
  if (body.attr.magic < MAGIC.volcano.min) {
    return;
  }
  const volcanos = [];
  const strength = getVolcanoStrength(body.attr);
  _.times(size.width / (90 - (strength / 5)), () => {
    const x = sprite.direction === 'left' ? random(size.width / 2, size.width) : random(0, size.width / 2);
    const volcanoMotion = Bodies.rectangle(x, size.height, 20, 20, {
      friction: 0,
      render: {
        sprite: {
          texture: MAGIC.volcano.image,
        },
      },
      force: {
        x: (Math.random() / 25) * (sprite.direction === 'left' ? -1 : 1),
        y: -0.04,
      },
      collisionFilter: {
        category: COLLISION.ATTACK,
        // eslint-disable-next-line no-bitwise
        mask: (COLLISION.POTATEMANS - category) | COLLISION.ATTACK,
      },
    });

    Body.setAngularVelocity(volcanoMotion, sprite.direction === 'left' ? -1 : 1);
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
}
