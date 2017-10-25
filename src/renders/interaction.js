import {
  Body,
  Events,
} from 'matter-js';
import input from '../helpers/input';
import { sink, punch, gard, gardCancel } from './potateman';

export default function ({
  act,
  engine,
  players,
}) {
  // eslint-disable-next-line no-param-reassign
  act.jp = (data) => {
    if (players[data.player]) {
      // eslint-disable-next-line no-param-reassign
      players[data.player].direction = input(data);
    }
  };

  Events.on(engine, 'collisionStart', (event) => {
    const { pairs } = event;
    const bodies = Object.keys(players).map(id => players[id].body);
    for (let i = 0, j = pairs.length; i < j; i += 1) {
      const pair = pairs[i];
      if (bodies.includes(pair.bodyA)) {
        // when potateman collision with some others, reset fly count
        bodies.find(body => body === pair.bodyA).attr.flycount = 0;
        if (pair.bodyB.attr && pair.bodyB.attr.type === 'shockWave') {
          let damage = pair.bodyB.attr.strength;
          if (pair.bodyA.attr.garding) {
            damage -= ((pair.bodyA.attr.gardGage / 100) * damage);
          }
          pair.bodyA.attr.damage += damage > 0 ? damage : 0;
          pair.bodyA.attr.magic += pair.bodyB.attr.strength / 3;
          // eslint-disable-next-line no-param-reassign
          players[pair.bodyB.attr.player].body.attr.magic += pair.bodyB.attr.strength;
          const density = 0.5 - (pair.bodyA.attr.damage / 1000);
          Body.setDensity(pair.bodyA, density > 0.005 ? density : 0.005);
          console.log(`density:${density > 0.005 ? density : 0.005} damage:${pair.bodyA.attr.damage}`);
        }
      } else if (bodies.includes(pair.bodyB)) {
        bodies.find(body => body === pair.bodyB).attr.flycount = 0;
      }
    }
  });

  Events.on(engine, 'beforeUpdate', () => {
    Object.keys(players).forEach((id) => {
      const { body, sprite, direction } = players[id];
      if (!body.velocity || !direction) {
        return;
      }
      let { x, y } = body.velocity;

      // left / right moving
      if (direction.left) {
        if (x >= -5) {
          x -= 1;
        }
        sprite.setState('walk');
        sprite.setDirection('left');
      }
      if (direction.right) {
        if (x <= 5) {
          x += 1;
        }
        sprite.setState('walk');
        sprite.setDirection('right');
      }

      // jump
      if (direction.up) {
        if (body.attr.flycount < 2 && !body.attr.flying) {
          y -= 10;
          body.attr.flycount += 1;
          body.attr.flying = true;
        }
        sprite.setState('walk');
      } else {
        body.attr.flying = false;
      }

      // attack
      if (direction.a) {
        sink({
          engine,
          sprite,
          body,
        });
      } else if (body.attr.punchGage) {
        punch({
          engine,
          sprite,
          body,
        });
      }

      // guard
      if (direction.b) {
        gard({
          engine,
          sprite,
          body,
        });
      } else {
        gardCancel({
          engine,
          sprite,
          body,
        });
      }

      // squat
      if (direction.down) {
        y += 0.5;
        sprite.setState('squat');
      }

      // neutral
      if (
        !direction.left &&
        !direction.right &&
        !direction.up &&
        !direction.down &&
        !direction.a &&
        !direction.b &&
        sprite.state !== 'punch'
      ) {
        sprite.setState('stand');
      }

      Body.setVelocity(body, {
        x,
        y,
      });
    });
  });
}
