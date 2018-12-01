import queryString from 'query-string';

const params = queryString.parse(window.location.search);

export default function postScoreFn(data) {
  if (data.fbid && params.cpu !== 'stupid') {
    const scoreUrl = `https://chaus.now.sh/apis/potateman/scores/${data.fbid}`;
    const scoresUrl = 'https://chaus.now.sh/apis/potateman/scores';
    fetch(scoreUrl, {
      mode: 'cors'
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return fetch(scoresUrl, {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fbid: data.fbid,
            score: 0,
            image: data.image
          })
          // eslint-disable-next-line function-paren-newline
        });
      })
      .then(res => (res.score || 0) + data.score)
      .then(score =>
        fetch(scoreUrl, {
          method: 'PATCH',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            score,
            image: data.image
          })
        }));
  }
}
