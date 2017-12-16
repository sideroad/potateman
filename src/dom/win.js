export default function winFn({ name, image, score }) {
  if (name) {
    document.getElementById('winner-character').style.backgroundImage = `url(${image})`;
    document.getElementById('winner-message').innerHTML = `${name} won the game!`;
    document.getElementById('winner-score').innerHTML = `Score: ${score.toLocaleString()}`;
  } else {
    document.getElementById('winner-character').style.backgroundImage = 'none';
    document.getElementById('winner-message').innerHTML = 'Draw the game!';
  }
  const winner = document.getElementById('winner');
  winner.style.display = 'block';
  setTimeout(() => {
    if (winner.style.display === 'block') {
      document.getElementById('restart').click();
    }
  }, 3000);
}
