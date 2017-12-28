export default function configFn() {
  const config = JSON.parse(localStorage.config || '{"magnify":true,"hasItem":true}');
  window.config = config;
  function check() {
    const name = this.getAttribute('name');
    const { checked } = this;

    if (checked) {
      window.config[name] = true;
    } else {
      window.config[name] = false;
    }
    localStorage.config = JSON.stringify(window.config);
  }
  document.querySelectorAll('.config input[type="checkbox"]').forEach((elem) => {
    if (config[elem.getAttribute('name')]) {
      // eslint-disable-next-line no-param-reassign
      elem.checked = true;
    }
    elem.addEventListener('click', check);
    elem.addEventListener('touchstart', check);
  });
}
