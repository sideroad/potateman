export default {
  start: () => {
    document.getElementById('loading').style.display = 'block';
  },
  end: () => {
    document.getElementById('loading').style.display = 'none';
  },
};
