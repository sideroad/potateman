export default function authFn(callback) {
  fetch('/auth', {
    credentials: 'include',
  })
    .then((res) => {
      res.json().then((user) => {
        if (user.name) {
          callback(user);
        } else {
          document.cookie = `redirect=${window.location.href}; path=/;`;
          window.location.href = '/auth/facebook';
        }
      });
      // eslint-disable-next-line
    });
}
