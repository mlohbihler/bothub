import { Vec2 } from 'planck'
import { StepEvent } from '../../@types'
import { polarToCart } from '../../boxUtil'
import Sensors from '../sensors'
import PathIntegrator from './pathIntegrator'

export default class CornerRecorder {
  sensors
  pathIntegrator
  lastStep?: number

  constructor(sensors: Sensors) {
    this.sensors = sensors
    // This class is instantiated when a contact is detected, so we use a path integrator to
    // remember where we were at that moment. This allows us to assemble the locations of
    // contacts into a structure.
    this.pathIntegrator = new PathIntegrator(sensors, 0)
  }

  points: Vec2[] = []

  step(evt: StepEvent) {
    if (this.lastStep && evt.step - this.lastStep > 1) {
      // Missed a call
      debugger
    }
    this.lastStep = evt.step

    const {
      sensors: { whiskers },
    } = this
    this.pathIntegrator.step(evt)

    whiskers.ids().forEach(id => {
      const length = whiskers.getLength(id)
      const depth = whiskers.getDepth(id)
      const angle = whiskers.getAngle(id) + this.pathIntegrator.angle
      const distance = length - depth
      const contactVector = polarToCart(distance, angle)

      contactVector.add(this.pathIntegrator.displacement)
      this.points.push(this.pathIntegrator.toWorld(contactVector))
    })
    this.points.forEach(p => {
      evt.debugRenderers.push(h => h.dot(p.x, p.y, 0.8, '#0aa'))
    })
  }
}
