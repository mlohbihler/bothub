import { StepEvent } from '../../@types'
import Actuators from './actuators'
import Sensors from './sensors'

export default class Behaviour {
  sensors
  actuators
  doneWhenFn?: (evt: StepEvent) => boolean

  constructor(sensors: Sensors, actuators: Actuators) {
    this.sensors = sensors
    this.actuators = actuators
  }

  #_initialized = false
  #_finalized = false

  initialize(_evt: StepEvent) {
    // Called when the behaviour is set to start running (again). Allows it to (re)initialize with
    // current context rather than the context when it was instantiated.
  }

  finalize(_evt: StepEvent) {
    // Called when the behaviour is done.
  }

  step(evt: StepEvent) {
    if (!this.#_initialized) {
      this.initialize(evt)
      this.#_initialized = true
    }
    evt.debugProps.Behaviour = this.constructor.name
  }

  doneWhen(fn: (evt: StepEvent) => boolean) {
    this.doneWhenFn = fn
    return this
  }

  done(evt: StepEvent) {
    const done = this.doneWhenFn ? this.doneWhenFn(evt) : this.defaultDone(evt)
    if (done && !this.#_finalized) {
      this.finalize(evt)
      this.#_finalized = true
    }
    return done
  }

  // Subsclasses should override this method to define a done state.
  defaultDone(_evt: StepEvent) {
    return false
  }
}
