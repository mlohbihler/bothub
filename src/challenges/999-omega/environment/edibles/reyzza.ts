import Edible, { EdibleBodyDef } from './edible'
import { AttributeDefinitions } from '../attributes/attribute'
import { FPS, regularPolygonVertices } from '../../../boxUtil'
import { Polygon } from 'planck'

export default class Reyzza extends Edible {
  static periodSteps = FPS * 11
  static startCount = 12
  // FIXME: this should be part of the environment
  static seasonDuration = FPS * 60 * 60 * 2 // 2 hours
  static seasonCount = 4
  static expiry = FPS * 60 * 60 * 6 // 6 hours
  static radius = 3

  static resourceAmounts = new Map([
    ['Water', 0.1],
    ['Energy', 0.1],
    ['Vitamium', 0.02],
    ['Minerium', 0.03],
  ])
  static textureDef: AttributeDefinitions = [
    [6, 2], //smoothness
    [11, 2], // temperature
    [11, 1], // solidity
  ]
  static scentDef: AttributeDefinitions = [
    [1, 0.5],
    [8, 2],
    [2.5, 1],
    [3, 1.5],
  ]

  createBody(step: number, defaults: EdibleBodyDef) {
    const { seasonDuration, seasonCount, presentSeason } = Reyzza
    const season = presentSeason(step, seasonDuration, seasonCount)
    let pos
    if (season === 0) {
      pos = this.centroidPosition(500, 100, 0.5)
    } else if (season === 1) {
      pos = this.centroidPosition(1400, 400, 0.5)
    } else if (season === 2) {
      pos = this.centroidPosition(1200, 1500, 0.5)
    }

    if (pos) {
      return this.createFromLocationAndShape(pos, defaults, Polygon(regularPolygonVertices(6, Reyzza.radius)), '#8f8')
    }
  }
}
