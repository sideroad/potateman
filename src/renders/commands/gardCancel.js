import {
  World,
} from 'matter-js';

export default function gardCancel({ engine, body }) {
  // eslint-disable-next-line no-param-reassign
  body.attr.garding = false;
  if (body.attr.gardMotion) {
    World.remove(engine.world, body.attr.gardMotion);
  }
  // eslint-disable-next-line no-param-reassign
  body.attr.gardMotion = undefined;
}
