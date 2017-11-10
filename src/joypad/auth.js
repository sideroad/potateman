export default function authFn(callback) {
  fetch('/auth', {
    credentials: 'include',
  })
    .then((res) => {
      res.json().then((user) => {
        if (user.name) {
          // eslint-disable-next-line no-new
          const image = new Image();
          image.onload = () => {
            callback(user);
          };
          image.src = user.image;
        } else {
          document.cookie = `redirect=${window.location.href}; path=/;`;
          window.location.href = '/auth/facebook';
        }
      });
      // eslint-disable-next-line
    });
}
