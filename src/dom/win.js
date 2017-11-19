export default function winFn({ name, image, score }) {
  if (name) {
    document.getElementById('winner-character').style.backgroundImage = `url(${image})`;
    document.getElementById('winner-message').innerHTML = `${name} won the game!`;
    document.getElementById('winner-score').innerHTML = `Score: ${score}`;
  } else {
    document.getElementById('winner-character').style.backgroundImage = 'none';
    document.getElementById('winner-message').innerHTML = 'Draw the game!';
  }
  document.getElementById('winner').style.display = 'block';
}
