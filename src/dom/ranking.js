export default function rankingFn({ items }) {
  const rankers = document.getElementById('rankers');
  const maxScore = items[0].score;
  rankers.innerHTML = `${
    items.map(item =>
      `<tr class="ranker">
        <td><img class="ranker-image" src="${item.image}" /></td>
        <td><div class="ranker-score" style="width: ${(item.score / maxScore) * 150}px;">${item.score.toLocaleString()}</div></td>
      </tr>`)
      .join('')
  }`;
}
