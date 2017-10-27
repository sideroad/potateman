class Sprite {
  constructor(body, image, states) {
    this.body = body;
    this.image = image;
    this.states = states;
    this.direction = 'left';
    this.step = 1;
  }

  setState(state) {
    if (state !== this.state) {
      this.state = state;
      this.count = 0;
      this.step = 1;
    }
  }

  setDirection(direction) {
    if (direction !== this.direction) {
      this.direction = direction;
      this.count = 0;
      this.step = 1;
    }
  }

  render() {
    const {
      direction,
      image,
      state,
      step,
    } = this;
    const { duration = 0, steps = 1, next } = this.states.find((_state => _state.state === state));
    this.body.render.sprite.texture = `/images/${image}-${state}-${direction}-${step}.png`;
    if (duration) {
      this.count += 1;
      if (duration < this.count) {
        this.count = 0;
        this.step += 1;
        if (steps < this.step) {
          this.step = 1;
          if (next) {
            this.setState(next);
          }
        }
        // eslint-disable-next-line
        this.body.render.sprite.texture = `/images/${image}-${state}-${direction}-${step}.png`;
      }
    }
  }
}

export default Sprite;
