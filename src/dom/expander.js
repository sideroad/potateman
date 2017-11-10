const expander = {
  start: () => {
    document.getElementById('expander').style.display = 'block';
  },
  end: () => {
    document.getElementById('expander').style.display = 'none';
  },
};

export default expander;
