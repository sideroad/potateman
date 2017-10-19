export default function () {
  const WebSocket = window.WebSocket || window.MozWebsocket;
  if (!WebSocket) {
    console.log('WebSocket is not defined');
    return null;
  }
  const ws = new WebSocket(`ws://${window.location.host}`);
  const act = {
    send: (data) => {
      ws.send(JSON.stringify(data));
    },
  };

  ws.onopen = () => {
    console.log('connected!');
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      console.log(data, act);
      if (act[data.act]) {
        act[data.act](data);
      }
    };

    act.send({
      act: 'init',
    });
  };

  ws.onclose = (...args) => {
    console.log(args);
  };
  return act;
}
