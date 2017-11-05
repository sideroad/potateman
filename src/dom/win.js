export default function winFn({ color, image }) {
  document.getElementById('winner-caret').style.borderColor = `${color} transparent`;
  document.getElementById('winner-character').style.backgroundImage = `url(${image})`;
  document.getElementById('winner').style.display = 'block';
}
