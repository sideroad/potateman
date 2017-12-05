import auth from '../helpers/auth';

export default function loginFn() {
  const loginsElem = document.getElementById('logins');
  function login() {
    if (loginsElem) {
      loginsElem.remove();
    }
    auth(this.id, () => {});
  }
  document.querySelectorAll('.login').forEach((elem) => {
    elem.addEventListener('click', login);
    elem.addEventListener('touchstart', login);
  });
}
