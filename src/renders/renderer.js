import {
  Engine,
  Render,
  Runner,
  MouseConstraint,
  Mouse,
  World,
} from 'matter-js';
import grounds from './grounds';
import potateman from './potateman';
import volcano from './volcano';
import boundary from './boundary';
import interaction from './interaction';

export default function (act) {
  // create engine
  const engine = Engine.create();
  const { world } = engine;

  // create renderer
  const size = {
    width: 1024,
    height: 800,
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
  const stack = [];
  interaction({
    act,
    engine,
    players,
  });
  // eslint-disable-next-line no-param-reassign
  act.attend = (data) => {
    stack.push(data);
    document.getElementById('attendee').innerHTML = stack.map(attendeeData =>
      `<div class="attendee-container">
          <div class="attendee-caset" style="border-color: ${attendeeData.color} transparent;"></div>
          <img class="attendee-character" src="/images/potateman-stand-left-1.png"/>
       </div>`).join('');
    if (stack.length >= 2) {
      document.getElementById('start').disabled = false;
    }
  };

  // eslint-disable-next-line no-param-reassign
  act.start = () => {
    if (document.getElementById('qr-container')) {
      document.getElementById('qr-container').remove();
    }
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
  };
  // eslint-disable-next-line no-param-reassign
  act.dead = (data) => {
    console.log(`dead:${data.player}`);
    World.remove(engine.world, players[data.player].body);
    // eslint-disable-next-line no-param-reassign
    delete players[data.player];
    if (Object.keys(players).length === 1) {
      const player = Object.values(players)[0];
      document.getElementById('winner-caset').style.borderColor = `${player.body.attr.color} transparent`;
      console.log(player.image);
      document.getElementById('winner-character').style.backgroundImage = `url(${player.image})`;
      document.getElementById('winner').style.display = 'block';
    }
  };
  volcano({ engine, size });
  boundary({ engine, size, act });

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
}
