/* eslint-disable no-param-reassign */

import {
  Body,
} from 'matter-js';
import thunder from './thunder';
import MAGIC from '../magic';

export default function giantFn({ engine, body, size }) {
  if (body.render.sprite.xScale === 0.75) {
    Body.scale(body, 4, 4);
    body.render.sprite.xScale = 3;
    body.render.sprite.yScale = 3;
    body.attr.power *= 3;
  }
  body.attr.magic += MAGIC.thunder.min;
  thunder({
    engine,
    body,
    size,
    ratio: 0.5,
  });
  body.attr.giant += 300;
}
