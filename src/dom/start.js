export default function startFn(callback) {
  document.getElementById('countdown').setAttribute('class', 'activate');
  setTimeout(() => {
    document.getElementById('countdown').removeAttribute('class');
    if (callback) {
      callback();
    }
  }, 4000);
}
