import auth from '../helpers/auth';

export default function facebookLoginFn() {
  document.getElementById('facebook-login').addEventListener('touchstart', () => {
    auth(() => {});
  });
}
