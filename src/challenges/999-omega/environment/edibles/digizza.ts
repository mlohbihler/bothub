import Edible, { EdibleBodyDef } from './edible'
import { AttributeDefinitions } from '../attributes/attribute'
import { FPS, regularPolygonVertices } from '../../../boxUtil'
import { Polygon } from 'planck'

export default class Digizza extends Edible {
  static periodSteps = FPS * 5
  static startCount = 1
  static expiry = FPS * 60 * 60 * 3 // 3 hours
  static radius = 3

  static resourceAmounts = new Map([
    ['Water', 0.05],
    ['Energy', 0.1],
    ['Toxium', 0.5],
  ])
  static textureDef: AttributeDefinitions = [
    [6, 3], //smoothness
    [8, 1], // temperature
    [12, 1.5], // solidity
  ]
  static scentDef: AttributeDefinitions = [
    [1, 0.5],
    [5, 2],
    [11, 1.5],
    [1, 0.5],
  ]

  createBody(_step: number, defaults: EdibleBodyDef) {
    const pos = this.nearbyPosition(600, 500, 200)
    if (pos) {
      return this.createFromLocationAndShape(pos, defaults, Polygon(regularPolygonVertices(4, Digizza.radius)), '#880')
    }
  }
}
