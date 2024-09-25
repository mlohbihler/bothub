import { Vec2 } from 'planck'
import { ISensors } from '../../@types'

export default class Sensors implements ISensors {
  // The amount of actuation that the controller wanted in the previous timestep. The controller
  // can wanted anything, but because of phsiological constraints may not be able to achieve it.
  prevTurnWanted = 0
  prevSpeedWanted = 0
  prevSidleWanted = 0

  // The amount of actuation the agent was able to actually attempt base on physiological
  // constraints. Constraints include maximum strength, and possibly fatigue and illness.
  prevTurnAttempted = 0
  prevSpeedAttempted = 0
  prevSidleAttempted = 0

  // The actual amount of translational movement (WRT the nose) made in the previous step
  prevVelocityAchieved = Vec2()
  // The actual amount of orientation change made in the previous step
  prevAngularVelocityAchieved = 0
}
