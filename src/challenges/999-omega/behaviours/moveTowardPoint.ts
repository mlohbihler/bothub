import PathIntegrator from '../tools/pathIntegrator'
import Behaviour from '../behaviour'
import Actuators, { maxSidle, maxSpeed } from '../actuators'
import Sensors from '../sensors'
import { Vec2 } from 'planck'
import { StepEvent } from '../../@types'
import { rotate } from '../../boxUtil'

// Moves toward the given point Maintaining the same orientation to the point.
export default class MoveTowardPoint extends Behaviour {
  pathIntegrator
  worldPoint?: Vec2

  // Given point is in the agent's FOR.
  constructor(sensors: Sensors, actuators: Actuators, point: Vec2) {
    super(sensors, actuators)
    this.pathIntegrator = new PathIntegrator(sensors)
    this.pathIntegrator.reset(-point.x, -point.y)
  }

  step(evt: StepEvent) {
    super.step(evt)
    const { actuators, pathIntegrator } = this

    if (!this.worldPoint) {
      // For debugging
      this.worldPoint = Vec2.sub(evt.position || Vec2(), rotate(pathIntegrator.displacement, evt.angle || 0))
    }
    pathIntegrator.step(evt)

    let speed = -pathIntegrator.displacement.x
    let sidle = -pathIntegrator.displacement.y

    if (sidle > maxSidle || sidle < -maxSidle) {
      const ratio = Math.abs(maxSidle / sidle)
      speed *= ratio
      sidle *= ratio
    }

    if (speed > maxSpeed) {
      sidle *= maxSpeed / speed
      speed *= maxSpeed / speed
    }

    actuators.speed = speed
    actuators.sidle = sidle

    evt.debugRenderers.push(h => h.dot(this.worldPoint?.x || 0, this.worldPoint?.y || 0, 2, '#0f0'))
    //   evt.debugRenderers.push(h =>
    //     h.line(this.worldPoint.x, this.worldPoint.y, evt.position.x, evt.position.y, '#fff', 1),
    //   )
    //   evt.debugRenderers.push(h => h.circle(this.worldPoint.x, this.worldPoint.y, this.distance, '#0f0', 1))
    //   evt.debugProps.worldDistance = Vector.magnitude(Vector.sub(this.worldPoint, evt.position)).toPrecision(4)
  }

  done(_evt: StepEvent) {
    return this.pathIntegrator.distanceSquared() < 0.05
  }
}
