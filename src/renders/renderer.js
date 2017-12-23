/* eslint-disable no-param-reassign */

import {
  Engine,
  Events,
  Render,
  Runner,
  World,
  Bounds,
} from 'matter-js';
import _ from 'lodash';
import Stats from 'stats.js';
import attendee from '../dom/attendee';
import start from '../dom/start';
import win from '../dom/win';
import grounds from './grounds';
import potateman, { destroy } from './characters/potateman';
import createGhost, { destroy as destroyGhost } from './characters/ghost';
import boundary from './boundary';
import items from './items';
import interaction from './interaction';
import cpu from './cpus/init';
import prefetch from './prefetch';
import postScore from '../helpers/postScore';

export default function (act) {
  // show stats
  const stats = new Stats();
  stats.dom.style.top = 'initial';
  stats.dom.style.left = 'initial';
  stats.dom.style.right = 0;
  stats.dom.style.bottom = 0;
  stats.dom.style.opacity = 0.25;
  document.body.appendChild(stats.dom);

  // create engine
  const engine = Engine.create();
  const { world } = engine;

  // create renderer
  const size = {};
  const applySize = (render) => {
    const { clientWidth, clientHeight } = document.body;
    size.width = clientWidth < 768 ? clientWidth * 2 : clientWidth;
    size.height = clientWidth < 768 ? clientHeight * 2 : clientHeight;
    if (render) {
      // eslint-disable-next-line no-param-reassign
      render.options.width = size.width;
      // eslint-disable-next-line no-param-reassign
      render.options.height = size.height;
      // eslint-disable-next-line no-param-reassign
      render.canvas.width = size.width;
      // eslint-disable-next-line no-param-reassign
      render.canvas.height = size.height;
      Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: size.width, y: size.height },
      });
    }
  };
  applySize();

  const render = Render.create({
    element: document.body,
    engine,
    options: {
      ...size,
      background: '#ffffff',
      showAngleIndicator: false,
      wireframes: false,
    },
  });

  Render.run(render);

  // create runner
  const runner = Runner.create();
  Runner.run(runner, engine);

  world.bodies = [];

  const players = {};
  const ghosts = {};
  const stack = [];

  // eslint-disable-next-line no-param-reassign
  act.attend = (data) => {
    if (stack.length > 16) {
      return;
    }
    stack.push(data);
    act.send({
      act: 'attend',
      stack,
      data,
    });
    attendee({ stack, image: data.image });
    if (stack.length >= 2) {
      document.getElementById('find').style.display = 'none';
      document.getElementById('start').style.display = 'block';
    }
  };
  // eslint-disable-next-line no-param-reassign
  act.mirror = () => {
    document.getElementById('find').disabled = true;
    act.send({
      act: 'mirror',
      data: {
        stack,
      },
    });
  };

  let cpuSequence = 1;
  // eslint-disable-next-line no-param-reassign
  act.cpu = () => {
    const id = `CPU${cpuSequence}`;
    act.attend({
      act: 'attend',
      image: `/images/cpu-${cpuSequence}.png`,
      player: id,
      name: id,
      cpu: true,
    });
    cpuSequence += 1;
  };

  let started = false;
  // eslint-disable-next-line no-param-reassign
  act.start = ({ stage }) => {
    const canvas = document.getElementsByTagName('canvas')[document.getElementsByTagName('canvas').length - 1];
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    started = true;
    fetch(`/api/stages/${stage}`, {
      method: 'DELETE',
    });
    act.send({
      act: 'start',
    });
    const {
      grounds: groundsBody,
      friction,
      hasItem,
      restitution,
    } = grounds({ engine, size });
    interaction({
      act,
      engine,
      players,
      ghosts,
      size,
      grounds: groundsBody,
    });
    Bounds.shift(render.bounds, {
      x: 0,
      y: 0,
    });
    render.bounds = {
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: size.width,
        y: size.height,
      },
    };
    start(() => {
      Events.on(engine, 'beforeUpdate', () => {
        stats.update();
      });
      act.stream(canvas);
      stack.forEach((data, index) => {
        players[data.player] = potateman({
          act,
          engine,
          size,
          index,
          fbid: data.fbid,
          player: data.player,
          name: data.name,
          image: data.image,
          cpu: data.cpu,
          render,
          friction,
          restitution,
        });
      });
      cpu({ engine, players, size });
      boundary({
        engine,
        size,
        act,
        players,
        render,
      });
      if (hasItem) {
        items({ engine, size });
      }
    });
  };
  // eslint-disable-next-line no-param-reassign
  act.dead = (data) => {
    // eslint-disable-next-line no-console
    console.log(`dead:${data.player}`);
    const player = players[data.player];
    player.dead = true;
    postScore({
      fbid: player.fbid,
      score: data.score,
      image: player.image,
    });
    destroy({ engine, body: player.body });
    ghosts[data.player] = createGhost({
      act,
      engine,
      size,
      name: player.name,
      image: player.image,
      player: data.player,
    });
    delete players[data.player];
    const remainPlayer = Object.values(players);
    if (remainPlayer.length <= 1) {
      const winner = remainPlayer[0].body.attr.player || {};
      const windata = {
        act: 'win',
        player: winner,
        fbid: (players[winner] || {}).fbid,
        name: (players[winner] || {}).name,
        image: (players[winner] || {}).image,
        score: Math.ceil((players[winner] || {
          body: {
            attr: {
              score: 0,
            },
          },
        }).body.attr.score),
      };
      act.send(windata);
      act.win(windata);
    }
  };

  // eslint-disable-next-line
  act.win = (data) => {
    const player = players[data.player];
    win(data);
    if (player) {
      destroy({ engine, body: player.body });
      // eslint-disable-next-line no-param-reassign
      delete players[player.player];
    }
    Object
      .values(ghosts)
      .forEach((ghost) => {
        destroyGhost({ engine, body: ghost.body });
        delete ghosts[ghost.body.attr.player];
      });
    engine.world.bodies.forEach((body) => {
      World.remove(engine.world, body);
    });
    World.clear(engine.world, false);
    Events.off(engine);
    postScore(data);
  };

  // eslint-disable-next-line
  act.leave = (data) => {
    if (started) {
      const deaddata = {
        act: 'dead',
        player: data.player,
        score: 0,
      };
      act.send(deaddata);
      act.dead(deaddata);
    } else {
      _.remove(stack, player => player.player === data.player);
    }
  };

  // fit the render viewport to the scene
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: size.width, y: size.height },
  });

  prefetch({ size, engine });
  window.addEventListener('orientationchange', () => {
    applySize(render);
  });
  window.addEventListener('resize', () => {
    applySize(render);
  });
}
