export default function attendeeFn({ stack, image }) {
  const attendee = document.getElementById('attendee');
  if (stack && !stack.length) {
    attendee.innerHTML = '';
  }
  const div = document.createElement('div');
  div.setAttribute('class', 'attendee-container');
  div.innerHTML = `
    <img class="attendee-character" src="${image}"/>
  `;
  attendee.appendChild(div);
}
