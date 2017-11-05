import 'babel-polyfill';
import QRious from 'qrious';
import Clipboard from 'clipboard';
import renderer from './renders/renderer';
import peer from './helpers/peer';

const act = peer();
act.init = (data) => {
  const url = `http://${window.location.host}/joypad/${data.stage}/`;
  const mirrorUrl = `http://${window.location.host}/mirror/${data.stage}/`;
  // eslint-disable-next-line no-new
  new QRious({
    element: document.getElementById('qr'),
    value: url,
  });
  console.log(url);
  document.querySelectorAll('.start').forEach((elem) => {
    elem.addEventListener('click', () => {
      act.start();
    });
  });
  const shareElem = document.getElementById('share');
  shareElem.setAttribute('data-clipboard-text', mirrorUrl);
  // eslint-disable-next-line no-new
  const clipboard = new Clipboard('.clipboard');
  clipboard.on('success', () => {
    const rect = shareElem.getBoundingClientRect();
    const div = document.createElement('div');
    div.setAttribute('class', 'tooltip');
    div.innerHTML = 'Copied URL!';
    document.body.appendChild(div);
    div.style.top = rect.top;
    div.style.left = rect.left - 60;
    setTimeout(() => {
      document.body.removeChild(div);
    }, 2000);
  });
};

renderer(act);

// document.getElementsByTagName('canvas')[0].webkitRequestFullscreen();
