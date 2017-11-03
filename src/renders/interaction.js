import {
  Body,
  Events,
} from 'matter-js';
import input from '../helpers/input';
import sink from './commands/sink';
import punch from './commands/punch';
import gard from './commands/gard';
import gardCancel from './commands/gardCancel';
import meteorite from './commands/meteorite';
import { check as collisionCheck } from './collision';

export default function ({
  act,
  engine,
  players,
  size,
}) {
  // eslint-disable-next-line no-param-reassign
  act.jp = (data) => {
    if (players[data.player]) {
      console.log('duration', new Date().valueOf() - data.t);
      // eslint-disable-next-line no-param-reassign
      players[data.player].direction = input(data);
    }
  };

  collisionCheck({ players, engine });

  Events.on(engine, 'beforeUpdate', () => {
    Object.keys(players).forEach((id) => {
      const { body, sprite, direction } = players[id];
      if (!body.velocity || !direction) {
        return;
      }
      let { x, y } = body.velocity;

      // left / right moving
      if (direction.left) {
        if (x >= -4) {
          x -= 1;
        }
        sprite.setState('walk');
        sprite.setDirection('left');
      }
      if (direction.right) {
        if (x <= 4) {
          x += 1;
        }
        sprite.setState('walk');
        sprite.setDirection('right');
      }

      // jump
      if (direction.up) {
        if (body.attr.flycount < 2 && !body.attr.keepTouchingJump) {
          if (!body.attr.flying) {
            y = -10;
          } else if (body.velocity.y > 0) {
            y = -5;
          } else {
            y -= 5;
          }
          body.attr.flycount += 1;
          body.attr.flying = true;
          body.attr.keepTouchingJump = true;
        }
        sprite.setState('walk');
      } else {
        body.attr.keepTouchingJump = false;
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
          direction,
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

      // meteorite
      if (
        direction.a &&
        direction.b
      ) {
        meteorite({
          engine,
          sprite,
          body,
          size,
        });
      }

      // squat
      if (direction.down) {
        y += 0.5;
        sprite.setState('squat');
      }

      // squat gard
      if (
        direction.down &&
        direction.b
      ) {
        body.attr.transparent = true;
      } else {
        body.attr.transparent = false;
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
