import { StepEvent } from '../../@types'
import Actuators from '../actuators'
import Behaviour from '../behaviour'
import Sensors from '../sensors'
import ContactMemory from '../tools/contactMemory'

export default class RandomExplore extends Behaviour {
  counter = 0
  turn = 0

  constructor(sensors: Sensors, actuators: Actuators) {
    super(sensors, actuators)
    // this.contactMemory = new ContactMemory(sensors)
  }

  step(evt: StepEvent) {
    super.step(evt)
    // this.contactMemory.step(evt)

    if (this.counter <= 0) {
      this.turn = (Math.random() - 0.5) / 15
      this.counter = 100
    }
    this.counter--

    this.actuators.speed = 2
    this.actuators.turn = this.turn
  }
}
