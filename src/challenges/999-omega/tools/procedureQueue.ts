import { StepEvent } from '../../@types'
import Behaviour from '../behaviour'

// Tool in which behaviours can be queued for subsequent execution
export default class ProcedureQueue {
  behaviours

  constructor(behaviours: Behaviour[] = []) {
    this.behaviours = behaviours
  }

  add(behaviour: Behaviour) {
    this.behaviours.push(behaviour)
  }

  step(evt: StepEvent) {
    let b: Behaviour | undefined = this.behaviours[0]
    if (b) {
      if (b.done(evt)) {
        b = this.behaviours.shift()
      }

      b?.step(evt)
    }
  }

  done(_evt: StepEvent) {
    return this.behaviours.length === 0
  }
}
