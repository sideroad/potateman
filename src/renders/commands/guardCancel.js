import {
  World,
} from 'matter-js';

export default function guardCancel({ engine, body }) {
  // eslint-disable-next-line no-param-reassign
  body.attr.guarding = false;
  if (body.attr.guardMotion) {
    World.remove(engine.world, body.attr.guardMotion);
  }
  // eslint-disable-next-line no-param-reassign
  body.attr.guardMotion = undefined;
}
