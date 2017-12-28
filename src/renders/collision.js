/* eslint-disable no-param-reassign */

import {
  Events,
  Body,
  World,
} from 'matter-js';
import giant from './commands/giant';
import cure from './motions/cure';

const COLLISION = {
  NONE: 0x0000,
  DEFAULT: 0x0001,
  GROUND: 0x0002,
  ATTACK: 0x0004,
  ITEM: 0x0008,
  GHOST: 0x0010,
  POTATEMAN0: 0x0020,
  POTATEMAN1: 0x0040,
  POTATEMAN2: 0x0080,
  POTATEMAN3: 0x0100,
  POTATEMAN4: 0x0200,
  POTATEMAN5: 0x0400,
  POTATEMAN6: 0x0800,
  POTATEMAN7: 0x1000,
  POTATEMAN8: 0x2000,
  POTATEMAN9: 0x4000,
  POTATEMAN10: 0x8000,
  POTATEMAN11: 0x10000,
  POTATEMAN12: 0x20000,
  POTATEMAN13: 0x40000,
  POTATEMAN14: 0x80000,
  POTATEMAN15: 0x100000,
  WALL: 0x200000,
};


COLLISION.POTATEMANS =
  // eslint-disable-next-line no-bitwise
  COLLISION.POTATEMAN0 |
  COLLISION.POTATEMAN1 |
  COLLISION.POTATEMAN2 |
  COLLISION.POTATEMAN3 |
  COLLISION.POTATEMAN4 |
  COLLISION.POTATEMAN5 |
  COLLISION.POTATEMAN6 |
  COLLISION.POTATEMAN7 |
  COLLISION.POTATEMAN8 |
  COLLISION.POTATEMAN9 |
  COLLISION.POTATEMAN10 |
  COLLISION.POTATEMAN11 |
  COLLISION.POTATEMAN12 |
  COLLISION.POTATEMAN13 |
  COLLISION.POTATEMAN14 |
  COLLISION.POTATEMAN15;

export default COLLISION;

const adjuster = {
  damage: {
    shockWave: 1.25,
    meteorite: 1,
    thunder: 0.75,
    volcano: 1,
  },
  magic: {
    shockWave: 1,
    meteorite: 0.6,
    thunder: 2,
    volcano: 0.15,
  },
  score: {
    shockWave: 0.5,
    meteorite: 0.4,
    thunder: 2,
    volcano: 0.15,
  },
  velocity: {
    shockWave: 0.5,
    meteorite: 0.4,
    thunder: 2,
    volcano: 0.1,
  },
};

export function check({
  players,
  engine,
  grounds,
  size,
}) {
  Events.on(engine, 'collisionStart', (event) => {
    const { pairs } = event;
    const bodies = Object
      .values(players)
      .map(player => player.body);
    const collisionConfirm = (bodyA, bodyB) => {
      if (bodies.includes(bodyA)) {
        // when potateman collision with some others, reset fly count
        if (grounds.find(ground => ground === bodyB)) {
          bodyA.attr.flycount = 0;
          bodyA.attr.flying = false;
          if (!bodyA.attr.guarding) {
            bodyA.attr.guardGage = 100;
          }
        }
        const { type, item } = bodyB.attr ? bodyB.attr : {};
        if (
          type === 'shockWave' ||
          type === 'meteorite' ||
          type === 'thunder' ||
          type === 'volcano'
        ) {
          let damage = bodyB.attr.strength;
          if (bodyA.attr.guarding) {
            damage -= ((bodyA.attr.guardGage / 100) * damage);
          }
          if (bodyA.attr.flycount > 1) {
            bodyA.attr.flycount = 1;
          }
          bodyA.attr.damage += damage > 0 ? damage * adjuster.damage[type] : 0;
          bodyA.attr.magic += (bodyB.attr.strength / 6) * adjuster.magic[type];
          let velocity = (bodyB.attr.strength * bodyA.attr.damage * adjuster.velocity[type]) / 300;
          const player = players[bodyB.attr.player];
          if (player) {
            player.body.attr.magic += (bodyB.attr.strength / 2) * adjuster.magic[type];
            player.body.attr.score += (bodyB.attr.strength / 2) * adjuster.score[type];
            bodyA.attr.lastAttacked = bodyB.attr.player;
            velocity *= player.body.attr.power / 100;
          }
          if (bodyA.attr.guarding) {
            velocity -= ((bodyA.attr.guardGage / 100) * velocity);
          }
          velocity /= (bodyA.render.sprite.xScale / 0.75) * (bodyA.render.sprite.yScale / 0.75);
          Body.setVelocity(bodyA, {
            x: (
              bodyB.velocity.x > 0 ? velocity :
              bodyB.velocity.x < 0 ? velocity * -1 :
              bodyA.position.x > bodyB.position.x ? velocity :
              velocity * -1
            ) + bodyA.velocity.x,
            y: (velocity * (type === 'shockWave' && bodyB.velocity.y ? 0.25 : -1)) + bodyA.velocity.y,
          });
          // eslint-disable-next-line no-console
          console.log(`strength: ${bodyB.attr.strength} velocity:${velocity} damage:${bodyA.attr.damage} type: ${type}`);
        }

        // curse collision
        if (
          type === 'curse'
        ) {
          bodyA.attr.damage += 1;
          bodyA.attr.cursed = true;
        }

        // items collision
        if (item) {
          switch (type) {
          case 'rescueBox':
            bodyA.attr.damage /= 2;
            break;
          case 'magicBox':
            bodyA.attr.magic += 100;
            break;
          case 'flamethrower':
            bodyA.attr.flamethrowers += 400;
            break;
          case 'giant':
            giant({
              engine,
              body: bodyA,
              size,
            });
            break;
          default:
          }
          World.remove(engine.world, bodyB);
          cure({ engine, body: bodyA });
        }
      }
    };

    for (let i = 0, j = pairs.length; i < j; i += 1) {
      const pair = pairs[i];
      collisionConfirm(pair.bodyA, pair.bodyB);
      collisionConfirm(pair.bodyB, pair.bodyA);
    }
  });
}
