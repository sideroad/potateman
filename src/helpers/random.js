export default function random(min, max) {
  return Math.ceil((Math.random() * (max - min)) + min);
}
