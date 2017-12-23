/* eslint-disable no-param-reassign */

import {
  Body,
  Events,
} from 'matter-js';
import { parse } from '../helpers/input';
import sink from './commands/sink';
import punch from './commands/punch';
import guard from './commands/guard';
import guardCancel from './commands/guardCancel';
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
  grounds,
}) {
  act.jp = (data, player) => {
    const direction = parse(data.i);
    if (players[player]) {
      players[player].direction = direction;
    }
    if (ghosts[player]) {
      ghosts[player].direction = direction;
    }
  };

  collisionCheck({
    players,
    engine,
    grounds,
    size,
  });

  Events.on(engine, 'beforeUpdate', () => {
    Object
      .values(players)
      .forEach((player) => {
        const { body, sprite, direction } = player;
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
          direction.left &&
          !body.attr.cursed
        ) {
          if (
            direction.b &&
            !direction.up &&
            !direction.down &&
            body.attr.guardGage > 1 &&
            !body.attr.flamethrowers
          ) {
            x = -75;
            y = -0.5;
            body.attr.teleported = true;
            body.attr.guardGage = 0;
            sprite.setState('squat');
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
          direction.right &&
          !body.attr.cursed
        ) {
          if (
            direction.b &&
            !direction.up &&
            !direction.down &&
            body.attr.guardGage > 1 &&
            !body.attr.flamethrowers
          ) {
            x = 75;
            y = -0.5;
            body.attr.teleported = true;
            body.attr.guardGage = 0;
            sprite.setState('squat');
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
        if (
          direction.up &&
          !direction.b &&
          !body.attr.cursed
        ) {
          if (body.attr.flycount < 3 && !body.attr.keepTouchingJump) {
            if (!body.attr.flying) {
              y = -12;
              body.attr.flycount += 1;
              body.attr.flying = true;
              body.attr.keepTouchingJump = true;
            } else if (body.velocity.y > 0) {
              y -= 13;
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
          !direction.b &&
          !body.attr.flamethrowers
        ) {
          sink({
            engine,
            sprite,
            body,
          });
        } else if (
          body.attr.punchGage &&
          !body.attr.flamethrowers
        ) {
          punch({
            engine,
            sprite,
            body,
            direction,
          });
        }

        // guard
        if (
          direction.b &&
          !body.attr.flamethrowers
        ) {
          guard({
            engine,
            sprite,
            body,
          });
        } else {
          guardCancel({
            engine,
            sprite,
            body,
          });
        }

        // squat
        if (direction.down) {
          if (direction.b) {
            y += 0.3;
          }
          sprite.setState('squat');
        }

        // squat guard
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
          ) &&
          !direction.up &&
          !body.attr.flamethrowers
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
          !direction.down &&
          direction.b &&
          body.attr.flying &&
          body.attr.guardGage > 1 &&
          !body.attr.flamethrowers
        ) {
          y = -3;
        }

        // thunder
        if (
          direction.c &&
          direction.down &&
          body.attr.magic > MAGIC.thunder.min &&
          !body.attr.flamethrowers
        ) {
          thunder({
            engine,
            sprite,
            body,
            size,
            ratio: 1,
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
          body.attr.magic > MAGIC.uppercut.min &&
          !body.attr.flamethrowers
        ) {
          uppercut({
            engine,
            sprite,
            body,
            size,
          });
          x = 0;
          y = -15;
          body.attr.flycount = 0;
        }

        // volcano
        if (
          direction.c &&
          !direction.up &&
          !direction.down &&
          !direction.left &&
          !direction.right &&
          body.attr.magic > MAGIC.volcano.min &&
          !body.attr.flamethrowers
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

        if (body.attr.cursed) {
          x /= 100;
          y /= 100;
        }
        Body.setVelocity(body, {
          x,
          y,
        });

        body.attr.cursed = false;
      });
    Object
      .values(ghosts)
      .forEach((ghost) => {
        const { body, sprite, direction } = ghost;
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
        if (
          direction.a
        ) {
          sink({
            engine,
            sprite,
            body,
          });
        } else if (
          body.attr.punchGage
        ) {
          punch({
            engine,
            sprite,
            body,
            direction,
          });
        }

        // curse
        if (direction.b) {
          body.attr.curse += 1;
        } else if (body.attr.curse) {
          body.attr.curse = 0;
        }
        x = direction.left ? x - 5 : direction.right ? x + 5 : x;
        y = direction.up ? y - 5 : direction.down ? y + 5 : y;
        Body.setPosition(body, {
          x,
          y,
        });
      });
  });
}
