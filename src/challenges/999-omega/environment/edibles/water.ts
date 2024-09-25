import Edible, { EdibleBodyDef } from './edible'
import { AttributeDefinitions } from '../attributes/attribute'
import { Circle } from 'planck'
import { FPS } from '../../../boxUtil'

export default class Water extends Edible {
  static periodSteps = FPS * 5
  static startCount = 100
  static centroidX = 1000
  static centroidY = 1000
  // TODO: reinstate
  static expiry = FPS * 60 // 1 hour
  // static expiry = FPS * 60 * 60 // 1 hour
  static radius = 3

  static resourceAmounts = new Map([['Water', 1]])
  static textureDef: AttributeDefinitions = [
    [4, 1], //smoothness
    [6, 1], // temperature
    [1, 0.4], // solidity
  ]
  static scentDef: AttributeDefinitions = [
    [1, 0.5],
    [0, 0.5],
    [0, 0.5],
    [1, 0.5],
  ]

  createBody(_step: number, defaults: EdibleBodyDef) {
    const { centroidX, centroidY } = Water
    const pos = this.centroidPosition(centroidX, centroidY)
    if (pos) {
      defaults.linearDamping = 6
      return this.createFromLocationAndShape(pos, defaults, Circle(Water.radius), '#00a')
    }
  }
}
