export default function random(min, max) {
  return Math.round((Math.random() * (max - min)) + min);
}
