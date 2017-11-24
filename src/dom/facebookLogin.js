import auth from '../helpers/auth';

export default function facebookLoginFn() {
  const facebookLoginElem = document.getElementById('facebook-login');
  facebookLoginElem.addEventListener('touchstart', () => {
    if (facebookLoginElem) {
      facebookLoginElem.remove();
    }
    auth(() => {});
  });
}
