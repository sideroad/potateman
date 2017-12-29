
export default function slimeFn({
  width,
  height,
  cellSize,
  makeGround,
  makeWall,
  // engine,
  // adjust,
}) {
  return {
    background: '#0D0015',
    textures: {
      ground: '/images/slime-ground.png',
      wall: '/images/slime-wall.png',
    },
    restitution: 1,
    friction: 15,
    shape: textures =>
      [
        ...makeGround({
          x: width / 2,
          y: 0,
          amount: Math.ceil(width / 1.5 / cellSize),
          textures,
          thick: 2,
          tunnel: false,
        }),
        ...makeGround({
          x: width / 2,
          y: height,
          amount: Math.ceil(width / 1.5 / cellSize),
          textures,
          thick: 2,
          tunnel: false,
        }),
        ...makeWall({
          x: width / 6,
          y: height / 2,
          amount: Math.ceil(height / cellSize),
          textures,
          thick: 2,
        }),
        ...makeWall({
          x: (width / 6) * 5,
          y: height / 2,
          amount: Math.ceil(height / cellSize),
          textures,
          thick: 2,
        }),
      ],
    setup: () => {},
    beforeUpdate: () => {},
  };
}
