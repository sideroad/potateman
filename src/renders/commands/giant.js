/* eslint-disable no-param-reassign */

import {
  Body,
} from 'matter-js';
import thunder from './thunder';
import MAGIC from '../magic';

export default function giantFn({ engine, body, size }) {
  if (body.render.sprite.xScale === 0.75) {
    Body.scale(body, 2, 2);
    body.render.sprite.xScale = 1.5;
    body.render.sprite.yScale = 1.5;
    body.attr.power *= 1.75;
  }
  body.attr.magic += MAGIC.thunder.min;
  thunder({
    engine,
    body,
    size,
    ratio: 0.25,
  });
  body.attr.giant += 400;
}
