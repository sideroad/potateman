import {
  Events,
  Body,
} from 'matter-js';

const COLLISION = {
  DEFAULT: 0x0001,
  GROUND: 0x0002,
  ATTACK: 0x0004,
  POTATEMAN0: 0x0008,
  POTATEMAN1: 0x0010,
  POTATEMAN2: 0x0020,
  POTATEMAN3: 0x0040,
  POTATEMAN4: 0x0080,
  POTATEMAN5: 0x0100,
  POTATEMAN6: 0x0200,
  POTATEMAN7: 0x0400,
  BOUNDARY: 0x0800,
  GHOST: 0x1000,
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
  COLLISION.POTATEMAN7;

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
          // eslint-disable-next-line no-param-reassign
          bodyA.attr.damage += damage > 0 ? damage : 0;
          // eslint-disable-next-line no-param-reassign
          bodyA.attr.magic += bodyB.attr.strength / 6;
          if (players[bodyB.attr.player]) {
            // eslint-disable-next-line no-param-reassign
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
          console.log(`strength: ${bodyB.attr.strength} velocity:${velocity} damage:${bodyA.attr.damage} type: ${type}`);
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
