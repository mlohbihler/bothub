import { StepEvent } from '../../@types'
import Behaviour from '../behaviour'
import { WhiskerId } from '../physiology'
import CircleAroundPoint from './circleAroundPoint'
import MoveTowardPoint from './moveTowardPoint'

// Turns the head whisker toward an obstacle to get the texture.
export default class SniffObstacle extends Behaviour {
  lastContactWhiskerId?: WhiskerId
  moveTowardPoint?: MoveTowardPoint
  circleAroundPoint?: CircleAroundPoint

  step(evt: StepEvent) {
    super.step(evt)
    const { sensors, actuators } = this
    const { whiskers } = sensors

    const info = whiskers.find(['hr', 'hl', 'r', 'l', 'tr', 'tl'])
    if (info) {
      const id = info.id
      if (this.lastContactWhiskerId !== id) {
        this.moveTowardPoint = undefined
        this.circleAroundPoint = undefined
      }

      if ((info.ratio || 0) < 0.5) {
        this.circleAroundPoint = undefined
        if (!this.moveTowardPoint) {
          this.moveTowardPoint = new MoveTowardPoint(sensors, actuators, whiskers.getContactPoint(id))
        }
      } else {
        this.moveTowardPoint = undefined
        if (!this.circleAroundPoint) {
          this.circleAroundPoint = new CircleAroundPoint(sensors, actuators, whiskers.getContactPoint(id))
        }
      }
      this.lastContactWhiskerId = id
    }

    this.moveTowardPoint?.step(evt)
    this.circleAroundPoint?.step(evt)
  }

  done(_evt: StepEvent) {
    return this.sensors.whiskers.has('h')
  }
}
