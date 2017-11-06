export default function authFn(callback) {
  fetch('/auth')
    .then((user) => {
      if (user.id) {
        callback(user);
      } else {
        document.cookie = `redirect=${window.location.href}`;
        window.location.href = '/auth/facebook';
      }
      // eslint-disable-next-line
    });
}
