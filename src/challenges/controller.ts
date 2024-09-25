import {
  IActuators,
  ISensors,
  KeyHandler,
  KeyHandlerAction,
  KeyHandlerFunction,
  SetupOptions,
  StepEvent,
} from '../@types'

export default class Controller {
  stepFunction: Function | undefined
  keyboard

  constructor() {
    this.keyboard = new Keyboard()
  }

  setup(options: SetupOptions) {
    this.keyboard.setKeyHandlers(options.keyHandlers)
  }

  updateStepFunction(fn: Function) {
    this.stepFunction = fn
  }

  step(evt: StepEvent, sensors: ISensors, actuators: IActuators) {
    actuators.clear()

    if (this.stepFunction) {
      this.stepFunction(evt, sensors, actuators)
    }

    this.keyboard.step(evt, actuators)
  }
}

class Keyboard {
  keyHandlers = new Map<string, [KeyHandlerAction, KeyHandlerFunction]>()
  downKeys = new Map<string, [KeyboardEvent, KeyHandlerFunction] | null>()
  keyWarns = new Set<string>()

  setKeyHandlers(defs: KeyHandler[] | undefined) {
    this.keyHandlers = new Map()
    defs?.forEach(({ keyCode, action, run }) => this.keyHandlers.set(keyCode, [action, run]))
  }

  step(evt: StepEvent, actuators: IActuators) {
    evt.keyEvents.forEach(kevt => {
      const { type, code } = kevt
      if (type === 'keydown') {
        const handler = this.keyHandlers.get(code)
        if (handler) {
          const [action, fn] = handler
          if (action === 'repeat') {
            this.downKeys.set(code, [kevt, fn])
          } else if (action === 'debounce') {
            if (!this.downKeys.has(code)) {
              this.downKeys.set(code, null)
              fn(actuators, kevt)
            }
          }
        } else {
          if (!this.keyWarns.has(code)) {
            console.log(`No handler for key code ${code}`)
            this.keyWarns.add(code)
          }
        }
      } else if (type === 'keyup') {
        this.downKeys.delete(code)
      }
    })

    if (this.downKeys.size) {
      this.downKeys.forEach(evtFn => evtFn && evtFn[1](actuators, evtFn[0]))
    }
  }
}
