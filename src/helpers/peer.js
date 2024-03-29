
export default function () {
  const peer = new window.Peer({
    host: window.location.hostname,
    port: window.location.port,
    path: '/peerjs',
  });
  const conns = [];
  const mirrors = [];
  const act = {
    send: (data) => {
      conns.forEach((conn) => {
        conn.send(data);
      });
    },
    stream: (elem) => {
      try {
        const stream = elem.captureStream();
        mirrors.forEach(mirror => mirror.answer(stream));  
      }catch(e) {
        console.warn(e);
      }
    },
  };
  setInterval(() => {
    peer.socket.send({
      type: 'KEEPALIVE',
    });
  }, 5000);
  peer.on('call', (mirror) => {
    mirrors.push(mirror);
  });
  peer.on('open', (id) => {
    act.init({
      act: 'init',
      stage: id,
    });
  });
  peer.on('connection', (conn) => {
    conns.push(conn);
    conn.on('data', (data) => {
      if (act[data.act]) {
        act[data.act](data, conn.peer);
      }
    });
    conn.on('close', () => {
      const leavedata = {
        act: 'leave',
        player: conn.peer,
      };
      act.send(leavedata);
      act.leave(leavedata);
    });
  });
  return act;
}
