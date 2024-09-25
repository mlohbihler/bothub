import { StepEvent } from '../../@types'
import Actuators from '../actuators'
import Behaviour from '../behaviour'
import Sensors from '../sensors'

export default class Move extends Behaviour {
  turn
  speed
  sidle
  steps?

  constructor(sensors: Sensors, actuators: Actuators, turn: number, speed: number, sidle: number, steps?: number) {
    super(sensors, actuators)
    this.turn = turn
    this.speed = speed
    this.sidle = sidle
    this.steps = steps
  }

  step(evt: StepEvent) {
    const { actuators, turn, speed, sidle } = this
    super.step(evt)

    actuators.turn = turn
    actuators.speed = speed
    actuators.sidle = sidle
    if (this.steps) this.steps--
  }

  defaultDone(_evt: StepEvent) {
    const { steps } = this
    return typeof steps === 'number' && steps <= 0
  }
}
