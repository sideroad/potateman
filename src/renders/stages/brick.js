import giant from '../commands/giant';

export default function brickFn({
  width,
  height,
  cellSize,
  makeGround,
  engine,
}) {
  return {
    background: '#fff2b2',
    textures: {
      ground: '/images/brick-ground.png',
    },
    restitution: 0,
    friction: 15,
    shape: textures =>
      [
        ...makeGround({
          x: width / 2,
          y: height / 2,
          amount: Math.ceil(width / 1.25 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 5,
          y: height / 5,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 3,
          y: (height / 5) * 4,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: (width / 5) * 4,
          y: height / 5,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: (width / 3) * 2,
          y: (height / 5) * 4,
          amount: Math.ceil(width / 5 / cellSize),
          textures,
        }),
      ],
    count: 1,
    setup: () => {},
    beforeUpdate: (count) => {
      if (count % 1500 === 0) {
        engine.world.bodies
          .forEach((body) => {
            if (body.attr && body.attr.type === 'potateman') {
              giant({
                engine,
                size: {
                  width,
                  height,
                },
                body,
              });
            }
          });
      }
    },
  };
}
