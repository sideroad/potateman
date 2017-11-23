export default function attendeeFn({ image }) {
  const attendee = document.getElementById('attendee');
  const message = document.getElementById('attendee-message');
  if (message) {
    message.remove();
  }
  const div = document.createElement('div');
  div.setAttribute('class', 'attendee-container');
  div.innerHTML = `
    <img class="attendee-character" src="${image}"/>
  `;
  attendee.appendChild(div);
}
