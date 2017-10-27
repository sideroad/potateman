import 'babel-polyfill';
import QRious from 'qrious';
import renderer from './renders/renderer';
import ws from './helpers/ws';
import prefetch from './helpers/prefetch';

prefetch();

const act = ws();

act.init = (data) => {
  // eslint-disable-next-line no-new
  new QRious({
    element: document.getElementById('qr'),
    value: `http://${window.location.host}/joypad/#${data.stage}`,
  });
};

document.querySelectorAll('.start').forEach((elem) => {
  elem.addEventListener('click', () => {
    document.getElementById('winner').style.display = 'none';
    act.send({
      act: 'start',
    });
  });
});

renderer(act);

// document.getElementsByTagName('canvas')[0].webkitRequestFullscreen();
