export default function input(data) {
  const keyMap = {
    0: {
      right: 1,
      up: 0,
      left: 0,
      down: 0,
    },
    1: {
      right: 1,
      up: 1,
      left: 0,
      down: 0,
    },
    2: {
      right: 0,
      up: 1,
      left: 0,
      down: 0,
    },
    3: {
      right: 0,
      up: 1,
      left: 1,
      down: 0,
    },
    4: {
      right: 0,
      up: 0,
      left: 1,
      down: 0,
    },
    5: {
      right: 0,
      up: 0,
      left: 1,
      down: 1,
    },
    6: {
      right: 0,
      up: 0,
      left: 0,
      down: 1,
    },
    7: {
      right: 1,
      up: 0,
      left: 0,
      down: 1,
    },
  };
  return {
    ...data,
    ...keyMap[data.ang],
  };
}
