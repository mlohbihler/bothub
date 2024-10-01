export default class Transition {
  from
  to
  steps
  count = 0
  stepAmount

  constructor(from: number, to: number, steps: number) {
    this.from = from
    this.to = to
    this.steps = steps
    this.stepAmount = (to - from) / steps
  }

  value() {
    return this.stepAmount * this.count + this.from
  }

  next() {
    const value = this.value()
    if (!this.isDone()) this.count++
    return value
  }

  isDone() {
    return this.count >= this.steps
  }
}
