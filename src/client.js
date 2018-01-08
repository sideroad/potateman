import 'babel-polyfill';
import QRious from 'qrious';
import Clipboard from 'clipboard';
import renderer from './renders/renderer';
import peer from './helpers/peer';
import auth from './helpers/auth';
import ranking from './dom/ranking';
import loading from './dom/loading';
import login from './dom/login';
import joypad from './dom/joypad';
import config from './dom/config';

login();
config();
const initialize = () =>
  new Promise((resolve) => {
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
      // eslint-disable-next-line no-console
      console.log(url);

      const start = () => {
        act.start(data);
      };
      document.querySelectorAll('.start').forEach((elem) => {
        elem.addEventListener('click', start);
        elem.addEventListener('touchstart', start);
      });

      let cpuIndex = 1;
      const addCpuElem = document.getElementById('add-cpu');
      const addCpu = () => {
        if (cpuIndex > 10) {
          return;
        }
        if (cpuIndex === 10) {
          addCpuElem.className = 'icon disabled';
        }
        act.cpu();
        cpuIndex += 1;
      };
      addCpuElem.addEventListener('click', addCpu);
      addCpuElem.addEventListener('touchstart', addCpu);

      document.querySelectorAll('.find').forEach((elem) => {
        const find = () => {
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
        };
        elem.addEventListener('click', find);
        elem.addEventListener('touchstart', find);
      });
      const shareElem = document.getElementById('share');
      shareElem.setAttribute('data-clipboard-text', mirrorUrl);
      // eslint-disable-next-line no-new
      const clipboard = new Clipboard('.clipboard');
      clipboard.on('success', (event) => {
        const rect = event.trigger.getBoundingClientRect();
        const div = document.createElement('div');
        div.setAttribute('class', 'tooltip');
        div.innerHTML = 'Copied Mirroring URL!';
        document.body.appendChild(div);
        div.style.top = rect.top;
        div.style.left = rect.left - 85;
        setTimeout(() => {
          document.body.removeChild(div);
        }, 2000);
      });
      resolve({
        act,
        data,
      });
    };

    fetch('https://chaus.herokuapp.com/apis/potateman/scores?orderBy=-score&limit=10')
      .then(res => res.json())
      .then(res => ranking(res));

    renderer(act);
  });

auth('', (user) => {
  loading.end();
  const loginsElem = document.getElementById('logins');
  if (loginsElem) {
    loginsElem.remove();
  }
  initialize()
    .then(({ act, data }) => {
      act.attend({
        stage: data.stage,
        player: data.stage,
        fbid: user.id,
        name: user.name,
        image: user.image,
        focus: true,
      });
      window.addEventListener('orientationchange', () => {
        joypad.destroy();
        joypad.binder(commands => act.jp(commands, data.stage));
      });
      window.addEventListener('resize', () => {
        joypad.destroy();
        joypad.binder(commands => act.jp(commands, data.stage));
      });
      joypad.binder(commands => act.jp(commands, data.stage));
    });
}, () => {
  initialize();
});
