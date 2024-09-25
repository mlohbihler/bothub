import { StepEvent } from '../../@types'
import Behaviour from '../behaviour'

export default class Spiral extends Behaviour {
  counter = 3
  // TODO rather than trying to control the turn, it would probably be better to control a radius
  // using a path integrator to increase it after having completed a circle. Maybe do this after
  // the turn goes below some value, like 0.05.
  turn = 1

  step(evt: StepEvent) {
    super.step(evt)
    const { sensors, actuators } = this

    actuators.turn = this.turn
    actuators.speed = 2

    evt.debugProps.turn = this.turn

    if (this.counter) {
      this.counter--
    } else if (this.turn > sensors.prevAngularVelocityAchieved) {
      this.turn = sensors.prevAngularVelocityAchieved
    }
    this.turn *= 0.99
  }
}
