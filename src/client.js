import 'babel-polyfill';
import QRious from 'qrious';
import Clipboard from 'clipboard';
import renderer from './renders/renderer';
import peer from './helpers/peer';
import ranking from './dom/ranking';

const act = peer();
act.init = (data) => {
  fetch(`/api/stages/${data.stage}`, {
    method: 'PUT',
  });
  const url = `${window.location.protocol}//${window.location.host}/joypad/${data.stage}/`;
  const mirrorUrl = `${window.location.protocol}//${window.location.host}/mirror/${data.stage}/`;
  // eslint-disable-next-line no-new
  new QRious({
    element: document.getElementById('qr'),
    value: url,
  });

  document.querySelectorAll('.start').forEach((elem) => {
    elem.addEventListener('click', () => {
      act.start(data);
    });
  });

  let cpuIndex = 1;
  const addCpuElem = document.getElementById('add-cpu');
  addCpuElem.addEventListener('click', () => {
    if (cpuIndex > 10) {
      return;
    }
    if (cpuIndex === 10) {
      addCpuElem.className = 'icon disabled';
    }
    act.cpu();
    cpuIndex += 1;
  });

  document.querySelectorAll('.find').forEach((elem) => {
    elem.addEventListener('click', () => {
      fetch(`/api/stages/${data.stage}/other`)
        .then(res => res.json())
        .then((json) => {
          if (json.stage) {
            window.location.href = `/mirror/${json.stage}/`;
          } else {
            // eslint-disable-next-line no-alert
            window.alert('Other room does not found');
          }
        });
    });
  });
  const shareElem = document.getElementById('share');
  shareElem.setAttribute('data-clipboard-text', mirrorUrl);
  const joypadElem = document.getElementById('joypad');
  joypadElem.setAttribute('data-clipboard-text', url);
  // eslint-disable-next-line no-new
  const clipboard = new Clipboard('.clipboard');
  clipboard.on('success', (event) => {
    const rect = event.trigger.getBoundingClientRect();
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

fetch('https://chaus.herokuapp.com/apis/potateman/scores?orderBy=-score')
  .then(res => res.json())
  .then(res => ranking(res));

renderer(act);
