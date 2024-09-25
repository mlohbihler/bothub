import Behaviour from '../behaviour'
import Actuators, { maxSidle, maxSpeed, maxTurn } from '../actuators'
import Sensors from '../sensors'
import { Vec2 } from 'planck'
import { rotate, vectorAngle } from '../../boxUtil'
import { StepEvent } from '../../@types'

// maintaining the same distance and orientation to the point.
export default class CircleAroundPoint extends Behaviour {
  point
  distance
  turn
  speed
  sidle

  worldPoint?: Vec2

  // Given point is in the agent's FOR.
  constructor(sensors: Sensors, actuators: Actuators, point: Vec2) {
    super(sensors, actuators)
    // point = { x: 0, y: 100 }
    // point = { x: 100, y: 100 }
    // point = { x: 100, y: 0 }
    // point = { x: 100, y: -100 }
    // point = { x: 0, y: -100 }
    // point = { x: -100, y: -100 }
    // point = { x: -100, y: 0 }
    // point = { x: -100, y: 100 }
    // point = { x: 8.9, y: 18.4 }

    // point = { x: 0, y: 15 }
    // point = { x: 11, y: 11 }
    // point = { x: 15, y: 0 }
    // point = { x: 11, y: -11 }
    // point = { x: 0, y: -15 }
    // point = { x: -11, y: -11 }
    // point = { x: -15, y: 0 }
    // point = { x: -11, y: 11 }

    this.point = point
    this.distance = point.length()

    let turn = maxTurn
    const centerToStart = Vec2.neg(point)
    const centerToTarget = rotate(centerToStart, turn)
    const startToTarget = Vec2.sub(centerToTarget, centerToStart)
    const beta = turn - vectorAngle(startToTarget)
    const h = startToTarget.length()
    let speed = Math.cos(beta) * h
    let sidle = -Math.sin(beta) * h

    if (speed < 0) {
      // Don't go backwards
      turn *= -1
      speed *= -1
      sidle *= -1
    }

    if (sidle > maxSidle || sidle < -maxSidle) {
      const ratio = Math.abs(maxSidle / sidle)
      turn *= ratio
      speed *= ratio
      sidle *= ratio
    }

    if (turn > maxTurn || turn < -maxTurn) {
      const ratio = Math.abs(maxTurn / turn)
      turn *= ratio
      speed *= ratio
      sidle *= ratio
    }

    if (speed > maxSpeed) {
      sidle *= maxSpeed / speed
      turn *= maxSpeed / speed
      speed *= maxSpeed / speed
    }

    this.turn = turn
    this.speed = speed
    this.sidle = sidle
  }

  step(evt: StepEvent) {
    super.step(evt)
    const { actuators, point } = this

    if (!this.worldPoint) {
      // For debugging
      this.worldPoint = Vec2.add(evt.position || Vec2(), rotate(point, evt.angle || 0))
    }

    actuators.turn = this.turn
    actuators.speed = this.speed
    actuators.sidle = this.sidle

    if (this.worldPoint) {
      const wp = this.worldPoint
      evt.debugRenderers.push(h => h.dot(wp.x, wp.y, 2, '#0f0'))
      evt.debugRenderers.push(h => h.line(wp.x, wp.y, evt.position?.x || 0, evt.position?.y || 0, '#fff', 1))
      evt.debugRenderers.push(h => h.circle(wp.x, wp.y, this.distance, '#0f0'))
      // evt.debugProps.worldDistance = Vector.magnitude(Vector.sub(this.worldPoint, evt.position)).toPrecision(4)
    }
  }
}
