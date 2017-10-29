
export default function () {
  const peer = new window.Peer({
    host: window.location.hostname,
    port: window.location.port,
    path: '/peerjs',
  });
  const conns = [];
  const act = {
    send: (data) => {
      conns.forEach((conn) => {
        conn.send(data);
      });
    },
  };
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
        act[data.act](data);
      }
    });
  });
  return act;
}
