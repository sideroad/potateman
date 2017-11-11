export default function winFn({ name, image }) {
  if (name) {
    document.getElementById('winner-character').style.backgroundImage = `url(${image})`;
    document.getElementById('winner-message').innerHTML = `${name} won the game!`;
  } else {
    document.getElementById('winner-character').style.backgroundImage = 'none';
    document.getElementById('winner-message').innerHTML = 'Draw the game!';
  }
  document.getElementById('winner').style.display = 'block';
}
