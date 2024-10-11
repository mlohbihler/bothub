import { Vec2 } from 'planck'
import { ISensors } from '../../@types'

export default class Sensors implements ISensors {
  prevVelocityAchieved = Vec2()
  prevAngularVelocityAchieved = 0
  contactAngle: number | undefined
  targetDistance: number = 0
  targetAngleDiff: number = 0
  goalDistance: number = 0
  goalAngleDiff: number = 0
}
