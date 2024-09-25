import { isNil } from '../../util'
import { radius, WhiskerId } from '../physiology'
import { StepEvent, Steppable } from '../../@types'
import Sensors from '../sensors'
import { AttributeValue } from '../environment/attributes/attribute'
import PathIntegrator from './pathIntegrator'
import { FPS, polarToCart } from '../../boxUtil'
import { Vec2 } from 'planck'

interface Datum {
  step: number
  type: 'whisker' | 'body' | 'nose'
  id?: WhiskerId
  texture?: AttributeValue
  scent?: AttributeValue
  world?: Vec2
}

export default class ContactMemory implements Steppable {
  sensors
  memory: Datum[]
  pathIntegrator

  constructor(sensors: Sensors) {
    this.sensors = sensors
    this.memory = []
    this.pathIntegrator = new PathIntegrator(sensors, 0)
  }

  step(evt: StepEvent) {
    const { sensors, memory, pathIntegrator } = this
    const { whiskers } = sensors
    pathIntegrator.step(evt)

    if (whiskers.any()) {
      whiskers.ids().forEach(id => {
        const distance = whiskers.getLength(id) - whiskers.getDepth(id)
        const angle = whiskers.getAngle(id) + pathIntegrator.angle
        const contactVector = polarToCart(distance, angle)
        contactVector.add(pathIntegrator.displacement)
        const world = pathIntegrator.toWorld(contactVector)
        memory.push({ step: evt.step, type: 'whisker', id, world })
      })
    }

    sensors.bodyContacts.forEach(c => {
      const contactVector = polarToCart(radius, c.angle + pathIntegrator.angle)
      contactVector.add(pathIntegrator.displacement)
      const world = pathIntegrator.toWorld(contactVector)
      memory.push({ step: evt.step, type: 'body', ...c, world })
    })

    if (!isNil(sensors.noseTexture) || !isNil(sensors.noseScent)) {
      memory.push({ step: evt.step, type: 'nose', texture: sensors.noseTexture, scent: sensors.noseScent })
    }

    memory.forEach(p => {
      // TODO could optimize this with a binary search for the start point.
      if (p.step > evt.step - FPS * 10) {
        // Only display contacts for ten seconds
        const color = p.type === 'whisker' ? '#0aa' : p.type === 'body' ? '#a00' : null
        if (color) evt.debugRenderers.push(h => h.dot(p.world?.x || 0, p.world?.y || 0, 0.8, color))
      }
    })
    evt.debugProps.MemoryPoints = memory.length
  }
}
