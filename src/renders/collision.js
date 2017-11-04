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
        if (
          bodyB.attr &&
          (
            bodyB.attr.type === 'shockWave' ||
            bodyB.attr.type === 'meteorite' ||
            bodyB.attr.type === 'thunder'
          )
        ) {
          let damage = bodyB.attr.strength;
          if (bodyA.attr.garding) {
            damage -= ((bodyA.attr.gardGage / 100) * damage);
          }
          // eslint-disable-next-line no-param-reassign
          bodyA.attr.damage += damage > 0 ? damage : 0;
          // eslint-disable-next-line no-param-reassign
          bodyA.attr.magic += bodyB.attr.strength / 6;
          // eslint-disable-next-line no-param-reassign
          players[bodyB.attr.player].body.attr.magic += bodyB.attr.strength / 2;
          let velocity = (bodyB.attr.strength * bodyA.attr.damage) / 300;
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
          console.log(`strength: ${bodyB.attr.strength} velocity:${velocity} damage:${bodyA.attr.damage} magic:${players[bodyB.attr.player].body.attr.magic} type: ${bodyB.attr.type}`);
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
