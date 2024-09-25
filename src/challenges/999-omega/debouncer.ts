import { clamp } from '../util'

export default class Debouncer {
  threshold
  counter = 0
  state = false
  change?: 'activated' | 'inactivated'

  constructor(threshold: number) {
    this.threshold = threshold
  }

  step(value: any) {
    this.counter = clamp(this.counter + (value ? 1 : -1), 0, this.threshold)

    if (!this.state && this.counter === this.threshold) {
      this.state = true
      this.change === 'activated'
      debugger
    } else if (this.state && this.counter === 0) {
      this.state = false
      this.change === 'inactivated'
      debugger
    } else if (this.change) {
      this.change = undefined
    }
  }

  active() {
    return this.state
  }

  activated() {
    return this.change === 'activated'
  }

  inactivated() {
    return this.change === 'inactivated'
  }
}
