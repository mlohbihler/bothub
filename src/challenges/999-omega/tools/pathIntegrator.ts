import { minimizeAngle } from '../../util'
import Sensors from '../sensors'
import { StepEvent } from '../../@types'
import { Vec2 } from 'planck'
import { rotate, vectorAngle } from '../../boxUtil'

export default class PathIntegrator {
  debug = false
  sensors
  angle
  displacement

  // Testing
  worldPosition?: Vec2
  worldAngle?: number

  constructor(sensors: Sensors, angle = -sensors.prevAngularVelocityAchieved) {
    this.sensors = sensors
    this.angle = angle
    this.displacement = Vec2()
  }

  reset(x = 0, y = 0, angle = 0) {
    this.angle = angle
    this.displacement.x = x
    this.displacement.y = y
    this.worldPosition = undefined
    this.worldAngle = undefined
  }

  step(evt: StepEvent) {
    if (!this.worldPosition) {
      // For debugging
      this.worldPosition = evt.position
      this.worldAngle = evt.angle
    }

    this.angle += this.sensors.prevAngularVelocityAchieved
    const diff = rotate(this.sensors.prevVelocityAchieved, this.angle)
    this.displacement.add(diff)

    if (this.debug) {
      const wp = this.worldPosition || Vec2()
      const wa = this.worldAngle || 0

      // Red dot represents the starting point of the PI
      // evt.debugRenderers.push(h => h.dot(wp.x, wp.y, 2, '#f00'))
      evt.debugHelper.dot(wp.x, wp.y, 2, '#f00')
      const v = Vec2(100, 0)
      rotate(v, wa, true)
      v.add(wp)

      // Red line is the starting angle of the PI
      evt.debugHelper.line(wp.x, wp.y, v.x, v.y, '#f00', 1)

      // Debugging
      const pos = rotate(this.displacement, wa)
      pos.add(wp)

      const extent = rotate(Vec2(40, 0), this.angle + wa)
      extent.add(pos)

      // Purple line is from the starting point to the agent
      evt.debugHelper.line(wp.x, wp.y, pos.x, pos.y, '#f0f', 1)
      // Blue line is the agent's present direction.
      evt.debugHelper.line(pos.x, pos.y, extent.x, extent.y, '#00f', 1)
    }
  }

  distanceSquared() {
    return this.displacement.lengthSquared()
  }

  distance() {
    return this.displacement.length()
  }

  returnAngle() {
    return vectorAngle(Vec2.neg(this.displacement))
  }

  returnAngleDiff() {
    return minimizeAngle(this.returnAngle() - this.angle)
  }

  minimizedAngle() {
    return minimizeAngle(this.angle)
  }

  toWorld(vec: Vec2) {
    const v = rotate(vec, this.worldAngle || 0)
    return v.add(this.worldPosition || Vec2())
  }
}
