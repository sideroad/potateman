import {
  Engine,
  Events,
  Render,
  Runner,
  MouseConstraint,
  Mouse,
  World,
} from 'matter-js';
import attendee from '../dom/attendee';
import start from '../dom/start';
import win from '../dom/win';
import grounds from './grounds';
import potateman, { destroy } from './potateman';
import createGhost, { destroy as destroyGhost } from './ghost';
import boundary from './boundary';
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

  grounds({ engine, size });
  const players = {};
  const ghosts = {};
  const stack = [];
  const colors = [
    '#ff0000',
    '#00cc00',
    '#3714b0',
    '#ffd200',
    '#ff9200',
    '#0b61a4',
    '#a101a6',
    '#cff700',
  ];
  // eslint-disable-next-line no-param-reassign
  act.attend = (data) => {
    const color = colors[stack.length];
    act.send({
      ...data,
      color,
    });
    attendee({ stack, color });
    stack.push({
      ...data,
      color,
    });
    if (stack.length >= 2) {
      const startButton = document.getElementById('start');
      startButton.innerHTML = 'Crash Potate!';
      startButton.disabled = false;
    }
  };

  // eslint-disable-next-line no-param-reassign
  act.start = () => {
    act.send({
      act: 'start',
    });
    start(() => {
      act.stream(document.getElementsByTagName('canvas')[0]);
      Events.off(engine);
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
          color: data.color,
          index,
          player: data.player,
        });
        act.jp({
          act: 'jp',
          a: 0,
          b: 0,
          player: data.player,
        });
      });
      boundary({
        engine,
        size,
        act,
        players,
      });
    });
  };
  // eslint-disable-next-line no-param-reassign
  act.dead = (data) => {
    console.log(`dead:${data.player}`);
    const { color } = players[data.player].body.attr;
    destroy({ engine, body: players[data.player].body });
    ghosts[data.player] = createGhost({
      act,
      engine,
      size,
      color,
      player: data.player,
    });
    // eslint-disable-next-line no-param-reassign
    delete players[data.player];
    if (Object.keys(players).length === 1) {
      const player = Object.keys(players)[0];
      const windata = {
        act: 'win',
        player,
        image: players[player].image,
        color: players[player].body.attr.color,
      };
      act.send(windata);
      act.win(windata);
    }
  };

  // eslint-disable-next-line
  act.win = (data) => {
    const player = players[data.player];
    win(data);
    destroy({ engine, body: player.body });
    // eslint-disable-next-line no-param-reassign
    delete players[player.player];
    Object.keys(ghosts).forEach((ghostId) => {
      destroyGhost({ engine, body: ghosts[ghostId].body });
      delete ghosts[ghostId];
    });
  };

  // add mouse control
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  });

  World.add(world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  // fit the render viewport to the scene
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: size.width, y: size.height },
  });

  prefetch({ size, engine });

  window.patch = (attr) => {
    Object.keys(players).forEach((id) => {
      players[id].body.attr = {
        ...players[id].body.attr,
        ...attr,
      };
    });
  };
}
