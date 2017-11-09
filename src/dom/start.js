export default function startFn(callback) {
  document.getElementById('winner').style.display = 'none';
  if (document.getElementById('qr-container')) {
    document.getElementById('qr-container').remove();
  }
  document.getElementById('countdown').setAttribute('class', 'activate');
  setTimeout(() => {
    document.getElementById('countdown').removeAttribute('class');
    if (callback) {
      callback();
    }
  }, 4000);
}
