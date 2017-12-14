const expander = {
  start: () => {
    const expanderElem = document.getElementById('expander');
    expanderElem.style.display = 'block';
    expanderElem.addEventListener('touchend', () => {
      const doc = window.document;
      const docEl = doc.documentElement;
      const requestFullScreen = docEl.requestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;

      if (requestFullScreen) {
        requestFullScreen.call(docEl);
      }
      expander.end();
    });
  },
  end: () => {
    document.getElementById('expander').style.display = 'none';
  },
};

export default expander;
