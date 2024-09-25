import Edible, { EdibleBodyDef } from './edible'
import { AttributeDefinitions } from '../attributes/attribute'
import { FPS, regularPolygonVertices } from '../../../boxUtil'
import { Polygon } from 'planck'

export default class Bracizza extends Edible {
  static periodSteps = FPS * 12
  static startCount = 100
  static expiry = FPS * 60 * 60 * 3 // 3 hours
  static radius = 3

  static resourceAmounts = new Map([
    ['Water', 0.1],
    ['Energy', 0.4],
    ['Vitamium', 0.1],
  ])
  static textureDef: AttributeDefinitions = [
    [3, 2], //smoothness
    [8, 1], // temperature
    [13, 1.5], // solidity
  ]
  static scentDef: AttributeDefinitions = [
    [1, 0.5],
    [10, 2],
    [1, 0.5],
    [1, 0.5],
  ]

  createBody(_step: number, defaults: EdibleBodyDef) {
    const pos = this.nearbyPosition(200, 300)
    if (pos) {
      return this.createFromLocationAndShape(pos, defaults, Polygon(regularPolygonVertices(3, Bracizza.radius)), '#2f0')
    }
  }
}
