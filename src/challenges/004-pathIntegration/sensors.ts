import { Vec2 } from 'planck'
import { ISensors } from '../../@types'

export default class Sensors implements ISensors {
  prevVelocityAchieved = Vec2()
  prevAngularVelocityAchieved = 0
  contact = false
}
