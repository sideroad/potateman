export default function rankingFn({ items }) {
  const rankers = document.getElementById('rankers');
  const maxScore = items[0].score;
  rankers.innerHTML = `${
    items.map((item, index) =>
      `<tr class="ranker">
        <td><div class="ranker-ranking ranker-ranking-${index + 1}" >${index + 1}</div></td>
        <td><img class="ranker-image" src="${item.image || '/images/cpu-1.png'}" /></td>
        <td>
          <div class="ranker-score" style="min-width: ${(item.score / maxScore) * 150}px;">
            <span class="ranker-score-inline">${item.score.toLocaleString()}</span>
          </div>
        </td>
      </tr>`)
      .join('')
  }`;
}
