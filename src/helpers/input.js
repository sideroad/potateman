/* eslint-disable no-bitwise */
const map = {
  ang: {
    0: 0x0001,
    1: 0x0002,
    2: 0x0004,
    3: 0x0008,
    4: 0x0010,
    5: 0x0020,
    6: 0x0040,
    7: 0x0080,
    8: 0x0100,
  },
  a: {
    0: 0x0200,
    1: 0x0400,
  },
  b: {
    0: 0x0800,
    1: 0x1000,
  },
  c: {
    0: 0x2000,
    1: 0x4000,
  },
};

export function parse(str) {
  const bit = parseInt(str, 32);
  const data = {
    ang:
    (bit & map.ang[0]) ? 0 :
    (bit & map.ang[1]) ? 1 :
    (bit & map.ang[2]) ? 2 :
    (bit & map.ang[3]) ? 3 :
    (bit & map.ang[4]) ? 4 :
    (bit & map.ang[5]) ? 5 :
    (bit & map.ang[6]) ? 6 :
    (bit & map.ang[7]) ? 7 :
    (bit & map.ang[8]) ? 8 : undefined,
    a: (bit & map.a[1]) ? 1 : 0,
    b: (bit & map.b[1]) ? 1 : 0,
    c: (bit & map.c[1]) ? 1 : 0,
  };
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

export function stringify({
  ang,
  a,
  b,
  c,
}) {
  const angbit = ang !== undefined ? map.ang[ang] : 0x0000;
  const abit = a !== undefined ? map.a[a] : 0x0000;
  const bbit = b !== undefined ? map.b[b] : 0x0000;
  const cbit = c !== undefined ? map.c[c] : 0x0000;
  return (angbit | abit | bbit | cbit).toString(32);
}
