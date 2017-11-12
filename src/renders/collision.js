/* eslint-disable no-param-reassign */

import {
  Events,
  Body,
  World,
} from 'matter-js';

import shrink from './motions/shrink';

const COLLISION = {
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
  shockWave: 0.5,
  meteorite: 1,
  thunder: 2,
  volcano: 0.2,
};

export function check({ players, engine }) {
  Events.on(engine, 'collisionStart', (event) => {
    const { pairs } = event;
    const bodies = Object.keys(players).map(id => players[id].body);
    const collisionConfirm = (bodyA, bodyB) => {
      if (bodies.includes(bodyA)) {
        // when potateman collision with some others, reset fly count
        const collisioned = bodies.find(body => body === bodyA);
        collisioned.attr.flycount = 0;
        collisioned.attr.flying = false;
        if (!collisioned.attr.garding) {
          collisioned.attr.gardGage = 100;
        }
        const { type } = bodyB.attr ? bodyB.attr : {};
        if (
          type === 'shockWave' ||
          type === 'meteorite' ||
          type === 'thunder' ||
          type === 'volcano'
        ) {
          let damage = bodyB.attr.strength;
          if (bodyA.attr.garding) {
            damage -= ((bodyA.attr.gardGage / 100) * damage);
          }
          bodyA.attr.damage += damage > 0 ? damage : 0;
          bodyA.attr.magic += bodyB.attr.strength / 6;
          if (players[bodyB.attr.player]) {
            players[bodyB.attr.player].body.attr.magic += bodyB.attr.strength / 2;
          }
          let velocity = (bodyB.attr.strength * bodyA.attr.damage * adjuster[type]) / 300;
          if (bodyA.attr.garding) {
            velocity -= ((bodyA.attr.gardGage / 100) * velocity);
          }
          Body.setVelocity(bodyA, {
            x: (
              bodyB.velocity.x > 0 ? velocity :
              bodyB.velocity.x < 0 ? velocity * -1 :
              bodyA.position.x > bodyB.position.x ? velocity :
              velocity * -1
            ) + bodyA.velocity.x,
            y: (velocity / -1) + bodyA.velocity.y,
          });
          // eslint-disable-next-line no-console
          console.log(`strength: ${bodyB.attr.strength} velocity:${velocity} damage:${bodyA.attr.damage} type: ${type}`);
        }

        // items collision
        if (
          type === 'rescueBox' ||
          type === 'magicBox'
        ) {
          switch (type) {
          case 'rescueBox':
            bodyA.attr.damage /= 2;
            break;
          case 'magicBox':
            bodyA.attr.magic += 100;
            break;
          default:
          }
          World.remove(engine.world, bodyB);
          shrink({
            engine,
            type: 'particle',
            strength: 15,
            velocity: {
              x: 0,
              y: -5,
            },
            render: {
              strokeStyle: '#999999',
              fillStyle: '#dddddd',
              opacity: 0.75,
              lineWidth: 1,
            },
            category: bodyA.attr.category,
            position: bodyA.position,
            player: bodyA.attr.player,
          });
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
