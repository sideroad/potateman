import 'babel-polyfill';
import QRious from 'qrious';
import renderer from './renders/renderer';
import peer from './helpers/peer';

const act = peer();
act.init = (data) => {
  const url = `http://${window.location.host}/joypad/${data.stage}/`;
  // eslint-disable-next-line no-new
  new QRious({
    element: document.getElementById('qr'),
    value: url,
  });
  console.log(url);
  document.querySelectorAll('.start').forEach((elem) => {
    elem.addEventListener('click', () => {
      document.getElementById('winner').style.display = 'none';
      act.start();
    });
  });
};

renderer(act);

// document.getElementsByTagName('canvas')[0].webkitRequestFullscreen();
