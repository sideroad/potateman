import loading from '../dom/loading';

export default function authFn(authenticator, callback, fallback) {
  loading.start();
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
          image.onerror = () => {
            user.image = '/images/cpu-1.png';
            callback(user);
          };
          image.src = user.image;
        } else if (fallback) {
          loading.end();
          fallback();
        } else {
          document.cookie = `redirect=${window.location.href}; path=/;`;
          window.location.href = `/auth/${authenticator}`;
        }
      });
      // eslint-disable-next-line
    });
}
