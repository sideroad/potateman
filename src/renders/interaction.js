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
import thunder from './commands/thunder';
import uppercut from './commands/uppercut';
import volcano from './commands/volcano';
import teleport from './commands/teleport';
import { check as collisionCheck } from './collision';
import MAGIC from './magic';

export default function ({
  act,
  engine,
  players,
  ghosts,
  size,
}) {
  // eslint-disable-next-line no-param-reassign
  act.jp = (data) => {
    const direction = input(data);
    if (players[data.player]) {
      // eslint-disable-next-line no-console
      console.log('duration', new Date().valueOf() - data.t);
      // eslint-disable-next-line no-param-reassign
      players[data.player].direction = direction;
    }
    if (ghosts[data.player]) {
      // eslint-disable-next-line no-param-reassign
      ghosts[data.player].direction = direction;
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

      if (
        body.attr.teleported
      ) {
        teleport({
          engine,
          body,
          sprite,
          x,
        });
        x = 0;
      }

      // left / right moving
      if (
        direction.left
      ) {
        if (
          direction.b &&
          !direction.up &&
          !direction.down &&
          body.attr.gardGage > 1
        ) {
          x = -50;
          y = -0.5;
          body.attr.teleported = true;
          body.attr.gardGage = 0;
          sprite.setState('gard');
        } else if (
          (x >= -3 && !direction.a && !body.attr.flying) ||
          (x >= -5 && direction.a && !body.attr.flying)
        ) {
          x -= 1;
          sprite.setState('walk');
          sprite.setDirection('left');
        } else if (
          (x >= -3 && !direction.a && body.attr.flying) ||
          (x >= -5 && direction.a && body.attr.flying)
        ) {
          x -= 0.5;
          sprite.setState('walk');
          sprite.setDirection('left');
        }
      }

      if (
        direction.right
      ) {
        if (
          direction.b &&
          !direction.up &&
          !direction.down &&
          body.attr.gardGage > 1
        ) {
          x = 50;
          y = -0.5;
          body.attr.teleported = true;
          body.attr.gardGage = 0;
          sprite.setState('gard');
        } else if (
          (x <= 3 && !direction.a && !body.attr.flying) ||
          (x <= 5 && direction.a && !body.attr.flying)
        ) {
          x += 1;
          sprite.setState('walk');
          sprite.setDirection('right');
        }
        if (
          (x <= 3 && !direction.a && body.attr.flying) ||
          (x <= 5 && direction.a && body.attr.flying)
        ) {
          x += 0.5;
          sprite.setState('walk');
          sprite.setDirection('right');
        }
      }

      // jump
      if (direction.up && !direction.b) {
        if (body.attr.flycount < 3 && !body.attr.keepTouchingJump) {
          if (!body.attr.flying) {
            y = -10;
            body.attr.flycount += 1;
            body.attr.flying = true;
            body.attr.keepTouchingJump = true;
          } else if (body.velocity.y > 0) {
            y -= 10;
            body.attr.flycount += 1;
            body.attr.flying = true;
            body.attr.keepTouchingJump = true;
          }
        }
        sprite.setState('walk');
      } else {
        body.attr.keepTouchingJump = false;
      }

      // attack
      if (
        direction.a &&
        !direction.b
      ) {
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

      // squat
      if (direction.down) {
        if (direction.b) {
          y += 0.3;
        } else {
          y += 0.1;
        }
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

      // meteorite
      if (
        direction.c &&
        (
          direction.left ||
          direction.right
        )
      ) {
        meteorite({
          engine,
          sprite,
          body,
          size,
        });
      }

      // floating
      if (
        direction.b &&
        body.attr.flying &&
        body.attr.gardGage > 1
      ) {
        y = -3;
      }

      // thunder
      if (
        direction.c &&
        direction.down &&
        body.attr.magic > MAGIC.thunder.min
      ) {
        thunder({
          engine,
          sprite,
          body,
          size,
        });
        x = 0;
        if (body.attr.flying) {
          y = 20;
        }
        body.attr.flycount = 0;
      }

      // uppercut
      if (
        direction.c &&
        direction.up &&
        body.attr.magic > MAGIC.uppercut.min
      ) {
        uppercut({
          engine,
          sprite,
          body,
          size,
        });
        x = 0;
        y = -12;
        body.attr.flycount = 0;
      }

      // volcano
      if (
        direction.c &&
        !direction.up &&
        !direction.down &&
        !direction.left &&
        !direction.right &&
        body.attr.magic > MAGIC.volcano.min
      ) {
        volcano({
          engine,
          sprite,
          body,
          size,
        });
      }

      // neutral
      if (
        !direction.left &&
        !direction.right &&
        !direction.up &&
        !direction.down &&
        !direction.a &&
        !direction.b &&
        !direction.c &&
        sprite.state !== 'punch'
      ) {
        sprite.setState('stand');
      }

      Body.setVelocity(body, {
        x,
        y,
      });
    });
    Object.keys(ghosts).forEach((id) => {
      const { body, sprite, direction } = ghosts[id];
      if (!body.position || !direction) {
        return;
      }
      let { x, y } = body.position;

      // left / right moving
      if (direction.left) {
        sprite.setDirection('left');
      }
      if (direction.right) {
        sprite.setDirection('right');
      }
      // attack
      if (direction.a && !body.attr.punched) {
        punch({
          engine,
          sprite,
          body,
          direction,
        });
        body.attr.punched = true;
      } else if (!direction.a) {
        body.attr.punched = false;
      }
      x = direction.left ? x - 3 : direction.right ? x + 3 : x;
      y = direction.up ? y - 3 : direction.down ? y + 3 : y;
      Body.setPosition(body, {
        x,
        y,
      });
    });
  });
}
