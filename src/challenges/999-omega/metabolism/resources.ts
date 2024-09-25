import { radius } from '../physiology'
import Sensors from '../sensors'
import Actuators from '../actuators'
import { StepEvent } from '../../../@types'
import Water from './water'
import Energy from './energy'
import Vitamium from './vitamium'
import Minerium from './minerium'
import Toxium from './toxium'
import Fatigue from './fatigue'
import Resource from './resource'
import { DebugHelper, shorten } from '../../../util'

const bottomMargin = 5
const lineWidth = 2
const lineLength = 25

export default class Resources {
  sensors
  resources
  lookup

  levelsDisplay = false

  constructor(sensors: Sensors, actuators: Actuators) {
    this.sensors = sensors
    this.resources = [
      new Water(sensors, actuators),
      new Energy(sensors, actuators),
      new Vitamium(sensors, actuators),
      new Minerium(sensors, actuators),
      new Toxium(sensors, actuators),
      new Fatigue(sensors, actuators),
    ]
    this.lookup = this.resources.reduce((o, r) => {
      o[r.constructor.name] = r
      return o
    }, {} as { [key: string]: Resource })
  }

  // Pre-step.
  updateSensors() {
    this.sensors.hunger = 0
    this.sensors.thirst = 0
    this.sensors.illness = 0
    this.sensors.fatigue = 0

    this.resources.forEach(r => r.updateSensors())
  }

  // Post step
  updateActuators() {
    this.resources.forEach(r => r.updateActuators())
  }

  // Post post step
  metabolize(evt: StepEvent) {
    const { resources, sensors } = this

    resources.forEach(r => r.metabolize())

    resources.forEach(r => (evt.debugProps[r.constructor.name] = `${shorten(r.amount)} / ${shorten(r.ingested)}`))
    if (sensors.hunger) evt.debugProps.Hunger = sensors.hunger
    if (sensors.thirst) evt.debugProps.Thirst = sensors.thirst
    if (sensors.illness) evt.debugProps.Illness = sensors.illness
    if (sensors.fatigue) evt.debugProps.Tiredness = sensors.fatigue

    if (this.levelsDisplay) {
      evt.debugRenderers.push((h: DebugHelper) => {
        const x = (evt.position?.x || 0) - radius
        const y = (evt.position?.y || 0) - bottomMargin - lineWidth * resources.length - radius
        h.getContext().globalAlpha = 0.5
        h.line(
          x,
          y + (lineWidth * resources.length) / 2 - 1,
          x + lineLength + 2 - 2,
          y + (lineWidth * resources.length) / 2 - 1,
          '#222',
          resources.length * lineWidth,
        )
        resources.forEach((r, i) => {
          h.line(x, y + i * lineWidth, x + lineLength * (r.amount / 1000), y + i * lineWidth, r.colour, lineWidth)
        })
      })
    }
  }

  isUnconscious() {
    return !!this.resources.find(r => r.isUnconscious())
  }

  isDead() {
    return !!this.resources.find(r => r.isDead())
  }

  ingest(name: string, amount: number) {
    const resource = this.lookup[name]
    if (!resource) {
      throw new Error(`no resource named ${name}`)
    }
    resource.ingest(amount)
  }
}
