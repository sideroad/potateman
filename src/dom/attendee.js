export default function attendeeFn({ stack, color }) {
  const attendee = document.getElementById('attendee');
  if (stack && !stack.length) {
    attendee.innerHTML = '';
  }
  const div = document.createElement('div');
  div.setAttribute('class', 'attendee-container');
  div.innerHTML = `
    <div class="attendee-caret" style="border-color: ${color} transparent;"></div>
    <img class="attendee-character" src="/images/potateman-stand-left-1.png"/>
  `;
  attendee.appendChild(div);
}
