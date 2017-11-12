import {
  Engine,
  Events,
  Render,
  Runner,
  World,
} from 'matter-js';
import attendee from '../dom/attendee';
import start from '../dom/start';
import win from '../dom/win';
import grounds from './grounds';
import potateman, { destroy } from './potateman';
import createGhost, { destroy as destroyGhost } from './ghost';
import boundary from './boundary';
import items from './items';
import interaction from './interaction';
import prefetch from './prefetch';

export default function (act) {
  // create engine
  const engine = Engine.create();
  const { world } = engine;

  // create renderer
  const size = {
    width: document.body.clientWidth,
    height: document.body.clientHeight,
  };

  const render = Render.create({
    element: document.body,
    engine,
    options: {
      ...size,
      background: '#F1F4FE',
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
    act.send(data);
    stack.push(data);
    attendee({ stack, image: data.image });
    if (stack.length >= 1) {
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

  // eslint-disable-next-line no-param-reassign
  act.start = ({ stage }) => {
    fetch(`/api/stages/${stage}`, {
      method: 'DELETE',
    });
    act.send({
      act: 'start',
    });
    grounds({ engine, size });
    start(() => {
      act.stream(document.getElementsByTagName('canvas')[0]);
      interaction({
        act,
        engine,
        players,
        ghosts,
        size,
      });
      stack.forEach((data, index) => {
        players[data.player] = potateman({
          act,
          engine,
          size,
          index,
          player: data.player,
          name: data.name,
          image: data.image,
        });
        act.jp({
          act: 'jp',
          a: 0,
          b: 0,
          c: 0,
          player: data.player,
        });
      });
      boundary({
        engine,
        size,
        act,
        players,
      });
      items({ engine, size });
    });
  };
  // eslint-disable-next-line no-param-reassign
  act.dead = (data) => {
    // eslint-disable-next-line no-console
    console.log(`dead:${data.player}`);
    const player = players[data.player];
    destroy({ engine, body: player.body });
    ghosts[data.player] = createGhost({
      act,
      engine,
      size,
      name: player.name,
      image: player.image,
      player: data.player,
    });
    // eslint-disable-next-line no-param-reassign
    delete players[data.player];
    if (Object.keys(players).length <= 1) {
      const winner = Object.keys(players)[0] || {};
      const windata = {
        act: 'win',
        player: winner,
        name: (players[winner] || {}).name,
        image: (players[winner] || {}).image,
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
    Object.keys(ghosts).forEach((ghostId) => {
      destroyGhost({ engine, body: ghosts[ghostId].body });
      delete ghosts[ghostId];
    });
    engine.world.bodies.forEach((body) => {
      World.remove(engine.world, body);
    });
    World.clear(engine.world, false);
    Events.off(engine);
  };

  // fit the render viewport to the scene
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: size.width, y: size.height },
  });

  prefetch({ size, engine });
}
