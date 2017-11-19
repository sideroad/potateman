export default function startFn(callback) {
  document.getElementById('winner').style.display = 'none';
  if (document.getElementById('reception')) {
    document.getElementById('reception').remove();
  }
  document.getElementById('countdown').setAttribute('class', 'activate');
  setTimeout(() => {
    document.getElementById('countdown').removeAttribute('class');
    if (callback) {
      callback();
    }
  }, 4000);
}
