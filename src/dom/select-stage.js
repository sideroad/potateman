let binded = false;
export default function selectStageFn(callback) {
  document.getElementById('winner').style.display = 'none';
  if (document.getElementById('reception')) {
    document.getElementById('reception').remove();
  }
  const selectStageElem = document.getElementById('select-stage');
  selectStageElem.style.display = 'flex';
  const stageElems = document.querySelectorAll('.stage');
  if (window.config && window.config.autoRestart) {
    selectStageElem.style.display = 'none';
    callback({ stage: '' });
    binded = true;
    return;
  }
  const listener = (event) => {
    selectStageElem.style.display = 'none';
    callback({ stage: event.target.getAttribute('id') });
    binded = true;
  };
  if (!binded) {
    stageElems.forEach((elem) => {
      elem.addEventListener('click', listener);
      elem.addEventListener('touchstart', listener);
    });
  }
}
