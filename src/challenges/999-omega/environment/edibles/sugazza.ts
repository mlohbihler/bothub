import Edible, { EdibleBodyDef } from './edible'
import { AttributeDefinitions } from '../attributes/attribute'
import { Polygon } from 'planck'
import { FPS, regularPolygonVertices } from '../../../../planck/boxUtil'

export default class Sugazza extends Edible {
  static periodSteps = FPS * 20
  static startCount = 20
  static seasonDuration = FPS * 60 * 60 * 2 // 2 hours
  static seasonCount = 5
  static expiry = FPS * 60 * 60 * 24 * 2 // 48 hours
  static radius = 3

  static resourceAmounts = new Map([['Energy', 2]])
  static textureDef: AttributeDefinitions = [
    [8, 2], //smoothness
    [9, 2], // temperature
    [13, 1], // solidity
  ]
  static scentDef: AttributeDefinitions = [
    [1, 0.5],
    [5, 2],
    [3, 1],
    [4, 1.5],
  ]

  createBody(step: number, defaults: EdibleBodyDef) {
    const { seasonDuration, seasonCount, presentSeason } = Sugazza
    const season = presentSeason(step, seasonDuration, seasonCount)
    if (season === 0) {
      const pos = this.centroidPosition(900, 1300, 0.25)
      if (pos) {
        return this.createFromLocationAndShape(
          pos,
          defaults,
          Polygon(regularPolygonVertices(7, Sugazza.radius)),
          '#4fb',
        )
      }
    }
  }
}
