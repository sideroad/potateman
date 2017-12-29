import COLLISION from '../collision';
import volcano from '../commands/volcano';

export default function volcanoFn({
  width,
  height,
  cellSize,
  makeGround,
  engine,
}) {
  return {
    background: '#ffead8',
    textures: {
      ground: '/images/volcano-ground.png',
    },
    restitution: 0,
    friction: 15,
    shape: textures =>
      [
        // eslint-disable-next-line max-len
        ...makeGround({
          x: width / 2,
          y: (height / 6) * 5,
          amount: Math.ceil(width / 1.5 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 2,
          y: (height / 6) * 3,
          amount: Math.ceil(width / 3 / cellSize),
          textures,
        }),
        ...makeGround({
          x: width / 2,
          y: (height / 6),
          amount: Math.ceil(width / 6 / cellSize),
          textures,
        }),
      ],
    count: 1,
    setup: () => {
    },
    beforeUpdate: (count) => {
      if (count % 100 === 0) {
        engine.world.bodies
          .forEach((body) => {
            if (body.attr && body.attr.type === 'potateman') {
              const increase = 10;
              // eslint-disable-next-line no-param-reassign
              body.attr.damage += increase;
            }
          });
      }
      if (count % 1000 === 0) {
        const volcanoOptions = {
          engine,
          size: {
            width,
            height,
          },
        };
        volcano({
          ...volcanoOptions,
          sprite: {
            direction: 'left',
          },
          body: {
            attr: {
              magic: 50,
              player: '',
              category: COLLISION.NONE,
            },
          },
        });
        volcano({
          ...volcanoOptions,
          sprite: {
            direction: 'right',
          },
          body: {
            attr: {
              magic: 50,
              player: '',
              category: COLLISION.NONE,
            },
          },
        });
      }
    },
  };
}
