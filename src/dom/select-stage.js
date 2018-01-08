let binded = false;
export default function selectStageFn(callback) {
  let selected = false;
  document.getElementById('winner').style.display = 'none';
  if (document.getElementById('reception')) {
    document.getElementById('reception').remove();
  }
  const selectStageElem = document.getElementById('select-stage');
  selectStageElem.style.display = 'flex';
  const stageElems = document.querySelectorAll('.stage');
  const listener = (event) => {
    if (selected) {
      return;
    }
    selected = true;
    callback({ stage: event.target.getAttribute('id') });
    selectStageElem.style.display = 'none';
    binded = true;
  };
  if (!binded) {
    stageElems.forEach((elem) => {
      elem.addEventListener('click', listener);
      elem.addEventListener('touchstart', listener);
    });
  }
  if (window.config.autoRestart) {
    setTimeout(() => {
      listener({
        target: {
          getAttribute: () => '',
        },
      });
    }, 3000);
  }
}
