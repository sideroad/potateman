export default function prefetch() {
  fetch('/prefetch.json')
    .then(res => res.json())
    .then(list => list.forEach((item) => {
      new Image().src = item;
    }));
}
