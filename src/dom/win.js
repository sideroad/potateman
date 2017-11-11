export default function winFn({ name, image }) {
  document.getElementById('winner-character').style.backgroundImage = `url(${image})`;
  document.getElementById('winner-message').innerHTML = `${name} won the game!`;
  document.getElementById('winner').style.display = 'block';
}
