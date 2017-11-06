export default function winFn({ image }) {
  document.getElementById('winner-character').style.backgroundImage = `url(${image})`;
  document.getElementById('winner').style.display = 'block';
}
