export default function startFn() {
  document.getElementById('winner').style.display = 'none';
  if (document.getElementById('qr-container')) {
    document.getElementById('qr-container').remove();
  }
}
