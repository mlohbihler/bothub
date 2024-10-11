import Edible, { EdibleBodyDef } from './edible'
import { AttributeDefinitions } from '../attributes/attribute'
import { Polygon } from 'planck'
import { FPS, regularPolygonVertices } from '../../../../planck/boxUtil'

export default class Lamizza extends Edible {
  static periodSteps = FPS * 10
  static startCount = 10
  static expiry = FPS * 60 * 30 // 30 minutes
  static seasonDuration = FPS * 60 * 60 // 1 hour
  static seasonCount = 3
  static radius = 3

  static resourceAmounts = new Map([
    ['Water', 0.1],
    ['Energy', 0.1],
    ['Vitamium', 0.02],
    ['Minerium', 0.03],
  ])
  static textureDef: AttributeDefinitions = [
    [6, 2], //smoothness
    [9, 2], // temperature
    [11, 1], // solidity
  ]
  static scentDef: AttributeDefinitions = [
    [1, 0.5],
    [10, 2],
    [3, 1],
    [4, 1.5],
  ]

  createBody(step: number, defaults: EdibleBodyDef) {
    const { seasonDuration, seasonCount, presentSeason } = Lamizza

    if (presentSeason(step, seasonDuration, seasonCount) === 0) {
      const pos = this.centroidPosition(400, 1200)
      if (pos) {
        return this.createFromLocationAndShape(
          pos,
          defaults,
          Polygon(regularPolygonVertices(5, Lamizza.radius)),
          '#4b4',
        )
      }
    }
  }
}
