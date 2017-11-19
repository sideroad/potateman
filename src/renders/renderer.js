import {
  Engine,
  Events,
  Render,
  Runner,
  World,
} from 'matter-js';
import _ from 'lodash';
import attendee from '../dom/attendee';
import start from '../dom/start';
import win from '../dom/win';
import grounds from './grounds';
import potateman, { destroy } from './potateman';
import createGhost, { destroy as destroyGhost } from './ghost';
import boundary from './boundary';
import items from './items';
import interaction from './interaction';
import cpu, { destroy as destroyCpu } from './cpus/init';
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
    started = true;
    fetch(`/api/stages/${stage}`, {
      method: 'DELETE',
    });
    act.send({
      act: 'start',
    });
    interaction({
      act,
      engine,
      players,
      ghosts,
      size,
      grounds: grounds({ engine, size }),
    });
    start(() => {
      act.stream(document.getElementsByTagName('canvas')[0]);
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
        });
      });
      cpu({ players, size, world });
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
    destroyCpu();
    cpu({ players, size, world });
    if (Object.keys(players).length <= 1) {
      const winner = Object.keys(players)[0] || {};
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
    Object.keys(ghosts).forEach((ghostId) => {
      destroyGhost({ engine, body: ghosts[ghostId].body });
      delete ghosts[ghostId];
    });
    destroyCpu();
    engine.world.bodies.forEach((body) => {
      World.remove(engine.world, body);
    });
    World.clear(engine.world, false);
    Events.off(engine);
    if (data.fbid) {
      const scoreUrl = `https://chaus.herokuapp.com/apis/potateman/scores/${data.fbid}`;
      const scoresUrl = 'https://chaus.herokuapp.com/apis/potateman/scores';
      fetch(scoreUrl, {
        mode: 'cors',
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          return fetch(scoresUrl, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fbid: data.fbid,
              score: 0,
            }),
          // eslint-disable-next-line function-paren-newline
          });
        })
        .then(res => (res.score || 0) + data.score)
        .then(score => fetch(scoreUrl, {
          method: 'PATCH',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score,
            image: data.image,
          }),
        }));
    }
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
}
