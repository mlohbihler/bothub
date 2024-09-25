import { StepEvent } from '../../../@types'
import { DebugHelper, distanceSquared } from '../../../util'
import PeriodTimeout from '../../tools/periodTimeout'
import Attribute, { AttributeDefinitions, AttributeValue } from './attribute'

type AmbienceAreaType = 'plain' | 'forest' | 'swamp' | 'meadow' | 'desert'
type AmbienceAreaDefinitions = { [key in AmbienceAreaType]: AttributeDefinitions }

export default class Ambience extends Attribute {
  // - brightness
  // - humidity
  // - colour (colourless to colourful)
  // TODO - temperature?
  static elementCount = 3

  static defs: AmbienceAreaDefinitions = {
    plain: [
      [12, 0.5],
      [3, 1.5],
      [4, 1.5],
    ],
    forest: [
      [3, 2],
      [8, 2],
      [3, 2],
    ],
    swamp: [
      [6, 2],
      [14, 1.5],
      [6, 3],
    ],
    meadow: [
      [10, 1],
      [3, 1.5],
      [10, 2],
    ],
    desert: [
      [15, 0.5],
      [0, 0.5],
      [2, 2],
    ],
  }

  static areas: Ambience[] = []
  static timeout: PeriodTimeout

  static initialize() {
    const { areas } = this

    areas.push(new Ambience('desert', 0, 0))
    areas.push(new Ambience('desert', 1600, 0))
    areas.push(new Ambience('desert', 1600, 1600))
    areas.push(new Ambience('desert', 0, 1600))
    areas.push(new Ambience('swamp', 1000, 1000))
    areas.push(new Ambience('plain', 400, 1200))
    areas.push(new Ambience('forest', 500, 100))
    areas.push(new Ambience('forest', 1400, 400))
    areas.push(new Ambience('forest', 1150, 200))
    areas.push(new Ambience('forest', 1300, 600))
    areas.push(new Ambience('forest', 950, 500))
    areas.push(new Ambience('forest', 1200, 1500))
    areas.push(new Ambience('meadow', 900, 1300))
    areas.push(new Ambience('meadow', 1200, 450))

    // Set up the update timeout
    this.timeout = new PeriodTimeout(60 * 1000, this.update)
  }

  static queryNearest(x: number, y: number): Ambience {
    let minDistance: number
    return this.areas.reduce((nearest, curr) => {
      const d = distanceSquared(x, y, curr.x, curr.y)
      if (nearest === null || d < minDistance) {
        minDistance = d
        return curr
      }
      return nearest
    }, null as Ambience | null) as Ambience
  }

  static step(evt: StepEvent) {
    this.timeout.step(evt)

    if (false) {
      const { areas } = this

      areas.forEach(({ value, x, y }) =>
        evt.debugRenderers.push((h: DebugHelper) => {
          h.getContext().globalAlpha = 0.3
          h.dot(x, y, 50, `#${this.asHex(value)}`)
        }),
      )

      const step = 20
      for (let x = 0; x <= 1600; x += step) {
        for (let y = 0; y <= 1600; y += step) {
          const value = this.queryNearest(x, y).value
          evt.debugRenderers.push((h: DebugHelper) => {
            h.getContext().globalAlpha = 0.1
            h.dot(x, y, 10, `#${this.asHex(value)}`)
          })
        }
      }
    }
  }

  static update() {
    Ambience.areas.forEach(a => a.update())
  }

  type: AmbienceAreaType
  x: number
  y: number
  value: AttributeValue

  constructor(type: AmbienceAreaType, x: number, y: number) {
    super()
    this.type = type
    this.x = x
    this.y = y
    this.value = Ambience.generate(Ambience.defs[type])
  }

  update() {
    const gen = Ambience.generate(Ambience.defs[this.type])
    this.value = Ambience.average(gen, this.value)
  }
}
