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
    flame: 1.5,
    shockWave: 1.25,
    lava: 1,
    meteorite: 1,
    thunder: 0.5,
    volcano: 0.5,
  },
  downable: {
    flame: true,
    shockWave: true,
    lava: true,
    meteorite: false,
    thunder: false,
    volcano: true,
  },
  magic: {
    flame: 1,
    shockWave: 1,
    lava: 1,
    meteorite: 0.6,
    thunder: 2,
    volcano: 0.05,
  },
  score: {
    flame: 0.25,
    shockWave: 0.5,
    lava: 0,
    meteorite: 0.4,
    thunder: 2,
    volcano: 0.15,
  },
  velocity: {
    flame: 0.3,
    shockWave: 0.7,
    lava: 0.25,
    meteorite: 0.45,
    thunder: 3.5,
    volcano: 0.3,
  },
  minVelocity: {
    flame: 5,
    shockWave: 10,
    lava: 15,
    meteorite: 10,
    thunder: 10,
    volcano: 5,
  },
  stunned: {
    attacker: {
      flame: 0,
      shockWave: 15,
      lava: 0,
      meteorite: 20,
      thunder: 20,
      volcano: 20,
    },
    attacked: {
      flame: 10,
      shockWave: 25,
      lava: 0,
      meteorite: 25,
      thunder: 25,
      volcano: 10,
    },
  },
  invincible: {
    flame: 1,
    shockWave: 0,
    lava: 0,
    meteorite: 0,
    thunder: 5,
    volcano: 0,
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
      if (bodies.includes(bodyA) && !bodyA.attr.invincible) {
        // when potateman collision with some others, reset fly count
        if (
          grounds.find(ground => ground === bodyB) &&
          bodyA.velocity.y >= 0
        ) {
          bodyA.attr.flycount = 0;
          bodyA.attr.flying = false;
          if (!bodyA.attr.guarding) {
            bodyA.attr.guardGage = 100;
          }
        }
        const { type, item } = bodyB.attr ? bodyB.attr : {};
        if (
          type === 'flame' ||
          type === 'shockWave' ||
          type === 'lava' ||
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
            player.body.attr.stunned = adjuster.stunned.attacker[type];
          }
          if (bodyA.attr.guarding) {
            velocity -= ((bodyA.attr.guardGage / 100) * velocity);
          } else {
            bodyA.attr.stunned = adjuster.stunned.attacked[type];
            bodyA.attr.invincible = adjuster.invincible[type];
          }
          velocity /= (bodyA.render.sprite.xScale / 0.75) * (bodyA.render.sprite.yScale / 0.75);
          if (Math.abs(velocity) < adjuster.minVelocity[type]) {
            velocity = adjuster.minVelocity[type] * (velocity > 0 ? 1 : -1);
          }
          if (velocity > 100) {
            velocity = 100;
          }
          const downable = adjuster.downable[type];
          Body.setVelocity(bodyA, {
            x:
            bodyB.velocity.x > 0 ? velocity :
            bodyB.velocity.x < 0 ? velocity * -1 :
            bodyA.position.x > bodyB.position.x ? velocity :
            bodyA.position.x < bodyB.position.x ? velocity * -1 :
            0,
            y:
            !downable ? velocity * -1 :
            bodyB.velocity.y > 0 && bodyB.velocity.x === 0 ? velocity :
            bodyB.velocity.y > 0 ? velocity * 0.5 :
            bodyB.velocity.y < 0 ? velocity * -1 :
            bodyA.position.y > bodyB.position.y ? velocity * 0.5 :
            velocity * -0.5,
          });
          // eslint-disable-next-line no-console
          console.log(`strength: ${bodyB.attr.strength} velocity:${velocity} damage:${bodyA.attr.damage} type: ${type}`);
        }

        // curse collision
        if (
          type === 'curse'
        ) {
          bodyA.attr.cursed = true;
          bodyA.attr.stunned = 20;
        }

        // water collision
        if (
          type === 'water'
        ) {
          Body.setVelocity(bodyA, {
            x: bodyA.velocity.x,
            y: bodyA.velocity.y + 1,
          });
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
