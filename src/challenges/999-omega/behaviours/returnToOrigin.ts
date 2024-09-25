import Behaviour from '../behaviour'
import Sensors from '../sensors'
import Actuators from '../actuators'
import PathIntegrator from '../tools/pathIntegrator'
import { StepEvent } from '../../@types'
import { clamp, near } from '../../util'

interface Options {
  distance?: number // the distance away from the orgin that should be achieved.
  returnToOriginalAngle?: boolean // whether to do that.
  stepPathIntegrator?: boolean // whether to step the integrator or if something else will do that.
  maxSpeed?: number
}

export default class ReturnToOrigin extends Behaviour {
  pathIntegrator
  options

  constructor(sensors: Sensors, actuators: Actuators, pathIntegrator: PathIntegrator, options: Options) {
    super(sensors, actuators)
    this.pathIntegrator = pathIntegrator
    this.options = options
  }

  isDone = false

  step(evt: StepEvent) {
    const { actuators, pathIntegrator, options } = this

    super.step(evt)
    if (options?.stepPathIntegrator) {
      pathIntegrator.step(evt)
    }

    // Use the integrated data to return back to the starting position.
    const dist = pathIntegrator.distance() - (options?.distance || 0)

    if (options?.distance) {
      // debugger
    }

    if (near(dist, 0, 0.05)) {
      // Close enough
      if (options?.returnToOriginalAngle) {
        const angle = pathIntegrator.minimizedAngle()
        if (near(angle, 0, 0.05)) {
          this.isDone = true
        } else {
          actuators.turn = -angle
        }
      } else {
        this.isDone = true
      }
    } else {
      const angle = pathIntegrator.returnAngleDiff()
      actuators.turn = angle
      // Don't move if the angle difference is too large.
      if (near(angle, 0, 0.05)) {
        const max = options?.maxSpeed
        const speed = dist / 2
        // TODO: find a way to prevent bouncing back and forth between negative and positive distances.
        // Why would that even happen?
        actuators.speed = max ? clamp(speed, -max, max) : speed
      }
    }
  }

  defaultDone(_evt: StepEvent) {
    return this.isDone
  }
}
