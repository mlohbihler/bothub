import { StepEvent } from '../../../@types'
import Behaviour from '../behaviour'

export default class Keyboard extends Behaviour {
  downKeys = new Map()

  step(evt: StepEvent) {
    evt.keyevents.forEach(e => {
      if (e.type === 'keydown') {
        if (e.code === 'ArrowUp') {
          this.repeat(e.code, () => (this.actuators.speed = e.shiftKey ? 10 : 2))
        } else if (e.code === 'ArrowDown') {
          this.repeat(e.code, () => (this.actuators.speed = -1))
        } else if (e.code === 'ArrowLeft') {
          this.repeat(e.code, () => (this.actuators.turn = e.shiftKey ? 0.1 : 0.02))
        } else if (e.code === 'ArrowRight') {
          this.repeat(e.code, () => (this.actuators.turn = e.shiftKey ? -0.1 : -0.02))
        } else if (e.code === 'KeyD') {
          this.debounce(e.code, () => (this.actuators.startDrink = true))
        } else if (e.code === 'KeyE') {
          this.debounce(e.code, () => (this.actuators.startEat = true))
        } else {
          console.log('keyevent', e)
        }
      }

      if (e.type === 'keyup') {
        this.downKeys.delete(e.code)
      }
    })

    if (this.downKeys.size) {
      this.downKeys.forEach(fn => fn && fn())
    }
  }

  repeat(code: string, fn: () => void) {
    this.downKeys.set(code, fn)
  }

  debounce(code: string, fn: () => void) {
    if (!this.downKeys.has(code)) {
      this.downKeys.set(code, null)
      fn()
    }
  }
}
